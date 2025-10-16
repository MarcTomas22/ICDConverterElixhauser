import { CodeConversion, SearchResult, SearchHistory, InsertSearchHistory, searchHistory } from "@shared/schema";
import { loadConversions } from "./data-loader";
import { findCMRCategories, getAllCMRCategoryNames } from "./cmr-elixhauser";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

function normalizeCode(code: string): string {
  return code.toUpperCase().trim().replace(/\./g, '');
}

type NormalizedConversionEntry = {
  icd10: string;
  normalizedIcd10: string;
  icd9Codes: string[];
  normalizedIcd9Codes: string[];
  categories: string[];
  elixhauserCategory: string | null;
};

export interface IStorage {
  searchCodes(query: string, category?: string): Promise<SearchResult[]>;
  searchCodesInverse(query: string, category?: string): Promise<SearchResult[]>;
  getCategories(): string[];
  initialize(): Promise<void>;
  saveSearchHistory(entry: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistory(limit?: number): Promise<SearchHistory[]>;
  deleteSearchHistory(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private conversionsMap: Map<string, CodeConversion[]> = new Map();
  private icd10Entries: NormalizedConversionEntry[] = [];
  private icd10TrigramIndex: Map<string, Set<NormalizedConversionEntry>> = new Map();
  private icd9TrigramIndex: Map<string, Set<NormalizedConversionEntry>> = new Map();
  private readonly TRIGRAM_LENGTH = 3;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log("Loading ICD10 to ICD9 conversions...");
    this.conversionsMap = await loadConversions();
    this.buildIndexes();
    console.log(`Loaded ${this.conversionsMap.size} unique ICD10 codes`);
    this.isInitialized = true;
  }

  private buildIndexes(): void {
    this.icd10Entries = [];
    this.icd10TrigramIndex.clear();
    this.icd9TrigramIndex.clear();

    this.conversionsMap.forEach((conversions, icd10) => {
      const normalizedIcd10 = normalizeCode(icd10);
      const uniqueIcd9Codes = Array.from(new Set<string>(conversions.map((c: CodeConversion) => c.icd9)));
      const normalizedIcd9Codes = uniqueIcd9Codes.map((code: string) => normalizeCode(code));
      const categories = findCMRCategories(icd10);
      const elixhauserCategory = categories.length > 0 ? categories[0] : null;

      const entry: NormalizedConversionEntry = {
        icd10,
        normalizedIcd10,
        icd9Codes: uniqueIcd9Codes,
        normalizedIcd9Codes,
        categories,
        elixhauserCategory,
      };

      this.icd10Entries.push(entry);
      this.indexEntry(this.icd10TrigramIndex, normalizedIcd10, entry);

      for (const normalizedIcd9 of normalizedIcd9Codes) {
        this.indexEntry(this.icd9TrigramIndex, normalizedIcd9, entry);
      }
    });
  }

  private indexEntry(
    index: Map<string, Set<NormalizedConversionEntry>>,
    value: string,
    entry: NormalizedConversionEntry,
  ): void {
    if (!value) return;

    if (value.length < this.TRIGRAM_LENGTH) {
      const bucket = index.get(value) ?? new Set<NormalizedConversionEntry>();
      bucket.add(entry);
      index.set(value, bucket);
      return;
    }

    for (let i = 0; i <= value.length - this.TRIGRAM_LENGTH; i++) {
      const trigram = value.slice(i, i + this.TRIGRAM_LENGTH);
      const bucket = index.get(trigram);
      if (bucket) {
        bucket.add(entry);
      } else {
        index.set(trigram, new Set([entry]));
      }
    }
  }

  getCategories(): string[] {
    return getAllCMRCategoryNames();
  }

  async searchCodes(query: string, category?: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const normalizedQuery = normalizeCode(query);
    const hasQuery = normalizedQuery.length > 0;
    const categoryFilter = category && category !== "all" ? category : undefined;
    const seenCodes = new Set<string>();
    const results: SearchResult[] = [];

    const candidates = this.getCandidates(this.icd10Entries, this.icd10TrigramIndex, normalizedQuery);

    for (const entry of candidates) {
      if (hasQuery && !entry.normalizedIcd10.includes(normalizedQuery)) {
        continue;
      }

      if (categoryFilter && !entry.categories.includes(categoryFilter)) {
        continue;
      }

      if (seenCodes.has(entry.icd10)) {
        continue;
      }

      seenCodes.add(entry.icd10);

      results.push({
        icd10: entry.icd10,
        icd9Codes: entry.icd9Codes,
        elixhauserCategory: entry.elixhauserCategory,
        elixhauserCategories: entry.categories.length > 0 ? entry.categories : undefined,
      });

      if (results.length >= 50) {
        break;
      }
    }

    return results.sort((a, b) => this.sortByStartsWith(a.icd10, b.icd10, normalizedQuery));
  }

  async searchCodesInverse(query: string, category?: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const normalizedQuery = normalizeCode(query);
    const hasQuery = normalizedQuery.length > 0;
    const categoryFilter = category && category !== "all" ? category : undefined;
    const seenCodes = new Set<string>();
    const results: SearchResult[] = [];

    const candidates = this.getCandidates(this.icd10Entries, this.icd9TrigramIndex, normalizedQuery);

    for (const entry of candidates) {
      if (categoryFilter && !entry.categories.includes(categoryFilter)) {
        continue;
      }

      if (hasQuery) {
        const matches = entry.normalizedIcd9Codes.some((code) => code.includes(normalizedQuery));
        if (!matches) {
          continue;
        }
      }

      if (seenCodes.has(entry.icd10)) {
        continue;
      }

      seenCodes.add(entry.icd10);

      results.push({
        icd10: entry.icd10,
        icd9Codes: entry.icd9Codes,
        elixhauserCategory: entry.elixhauserCategory,
        elixhauserCategories: entry.categories.length > 0 ? entry.categories : undefined,
      });

      if (results.length >= 50) {
        break;
      }
    }

    return results.sort((a, b) => this.sortInverseByStartsWith(a.icd9Codes, b.icd9Codes, normalizedQuery, a.icd10, b.icd10));
  }

  private getCandidates(
    fallback: NormalizedConversionEntry[],
    index: Map<string, Set<NormalizedConversionEntry>>,
    normalizedQuery: string,
  ): NormalizedConversionEntry[] {
    if (normalizedQuery.length >= this.TRIGRAM_LENGTH) {
      const trigram = normalizedQuery.slice(0, this.TRIGRAM_LENGTH);
      const bucket = index.get(trigram);
      if (!bucket) {
        return [];
      }
      return Array.from(bucket);
    }

    if (normalizedQuery.length > 0) {
      // For very short queries we fall back to a linear scan to preserve accuracy.
      return fallback;
    }

    return fallback;
  }

  private sortByStartsWith(aIcd10: string, bIcd10: string, normalizedQuery: string): number {
    if (!normalizedQuery) {
      return aIcd10.localeCompare(bIcd10);
    }

    const aNormalized = normalizeCode(aIcd10);
    const bNormalized = normalizeCode(bIcd10);
    const aStartsWith = aNormalized.startsWith(normalizedQuery);
    const bStartsWith = bNormalized.startsWith(normalizedQuery);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    return aIcd10.localeCompare(bIcd10);
  }

  private sortInverseByStartsWith(
    aCodes: string[],
    bCodes: string[],
    normalizedQuery: string,
    aIcd10: string,
    bIcd10: string,
  ): number {
    if (!normalizedQuery) {
      return aIcd10.localeCompare(bIcd10);
    }

    const aHasStartsWith = aCodes.some((code) => normalizeCode(code).startsWith(normalizedQuery));
    const bHasStartsWith = bCodes.some((code) => normalizeCode(code).startsWith(normalizedQuery));

    if (aHasStartsWith && !bHasStartsWith) return -1;
    if (!aHasStartsWith && bHasStartsWith) return 1;

    return aIcd10.localeCompare(bIcd10);
  }

  async saveSearchHistory(entry: InsertSearchHistory): Promise<SearchHistory> {
    const [result] = await db.insert(searchHistory).values(entry).returning();
    return result;
  }

  async getSearchHistory(limit: number = 50): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }

  async deleteSearchHistory(id: number): Promise<void> {
    await db.delete(searchHistory).where(eq(searchHistory.id, id));
  }
}

export const storage = new MemStorage();
