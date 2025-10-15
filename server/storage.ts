import { CodeConversion, SearchResult, SearchHistory, InsertSearchHistory, searchHistory } from "@shared/schema";
import { loadConversions } from "./data-loader";
import { findCMRCategories, getAllCMRCategoryNames, getCMRCategoryCode } from "./cmr-elixhauser";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

function normalizeCode(code: string): string {
  return code.toUpperCase().trim().replace(/\./g, '');
}

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
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log("Loading ICD10 to ICD9 conversions...");
    this.conversionsMap = await loadConversions();
    console.log(`Loaded ${this.conversionsMap.size} unique ICD10 codes`);
    this.isInitialized = true;
  }

  getCategories(): string[] {
    return getAllCMRCategoryNames();
  }

  async searchCodes(query: string, category?: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const queryUpper = query.toUpperCase().trim();
    const normalizedQuery = normalizeCode(queryUpper);
    const results: SearchResult[] = [];
    const seenCodes = new Set<string>();

    for (const [icd10, conversions] of Array.from(this.conversionsMap.entries())) {
      const normalizedIcd10 = normalizeCode(icd10);
      if (normalizedIcd10.includes(normalizedQuery)) {
        if (!seenCodes.has(icd10)) {
          seenCodes.add(icd10);
          
          const icd9Codes = Array.from(new Set(conversions.map((c: CodeConversion) => c.icd9)));
          const categories = findCMRCategories(icd10);
          const elixhauserCategory = categories.length > 0 ? categories[0] : null;
          
          if (category && category !== "all") {
            if (!categories.includes(category)) {
              continue;
            }
          }
          
          results.push({
            icd10,
            icd9Codes,
            elixhauserCategory,
            elixhauserCategories: categories.length > 0 ? categories : undefined
          });
        }
      }

      if (results.length >= 50) break;
    }

    return results.sort((a, b) => {
      const aNormalized = normalizeCode(a.icd10);
      const bNormalized = normalizeCode(b.icd10);
      const aStartsWith = aNormalized.startsWith(normalizedQuery);
      const bStartsWith = bNormalized.startsWith(normalizedQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.icd10.localeCompare(b.icd10);
    });
  }

  async searchCodesInverse(query: string, category?: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const queryUpper = query.toUpperCase().trim();
    const results: SearchResult[] = [];
    const seenCodes = new Set<string>();

    for (const [icd10, conversions] of Array.from(this.conversionsMap.entries())) {
      const icd9Codes = conversions.map((c: CodeConversion) => c.icd9);
      const hasMatchingIcd9 = icd9Codes.some(icd9 => {
        const normalizedIcd9 = normalizeCode(icd9);
        const normalizedQuery = normalizeCode(queryUpper);
        return normalizedIcd9.includes(normalizedQuery);
      });
      
      if (hasMatchingIcd9) {
        if (!seenCodes.has(icd10)) {
          seenCodes.add(icd10);
          
          const uniqueIcd9Codes = Array.from(new Set(icd9Codes));
          const categories = findCMRCategories(icd10);
          const elixhauserCategory = categories.length > 0 ? categories[0] : null;
          
          if (category && category !== "all") {
            if (!categories.includes(category)) {
              continue;
            }
          }
          
          results.push({
            icd10,
            icd9Codes: uniqueIcd9Codes,
            elixhauserCategory,
            elixhauserCategories: categories.length > 0 ? categories : undefined
          });
        }
      }

      if (results.length >= 50) break;
    }

    const normalizedQuery = normalizeCode(queryUpper);
    
    return results.sort((a, b) => {
      const aHasStartsWith = a.icd9Codes.some(code => {
        const normalizedCode = normalizeCode(code);
        return normalizedCode.startsWith(normalizedQuery);
      });
      const bHasStartsWith = b.icd9Codes.some(code => {
        const normalizedCode = normalizeCode(code);
        return normalizedCode.startsWith(normalizedQuery);
      });
      
      if (aHasStartsWith && !bHasStartsWith) return -1;
      if (!aHasStartsWith && bHasStartsWith) return 1;
      
      return a.icd10.localeCompare(b.icd10);
    });
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
