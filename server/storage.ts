import { CodeConversion, SearchResult } from "@shared/schema";
import { loadConversions } from "./data-loader";
import { findElixhauserCategory, elixhauserCategories } from "./elixhauser-data";

export interface IStorage {
  searchCodes(query: string, category?: string): Promise<SearchResult[]>;
  getCategories(): string[];
  initialize(): Promise<void>;
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
    return elixhauserCategories.map(cat => cat.category).sort();
  }

  async searchCodes(query: string, category?: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const queryUpper = query.toUpperCase().trim();
    const results: SearchResult[] = [];
    const seenCodes = new Set<string>();

    for (const [icd10, conversions] of Array.from(this.conversionsMap.entries())) {
      if (icd10.toUpperCase().includes(queryUpper)) {
        if (!seenCodes.has(icd10)) {
          seenCodes.add(icd10);
          
          const icd9Codes = Array.from(new Set(conversions.map((c: CodeConversion) => c.icd9)));
          const elixhauserCategory = findElixhauserCategory(icd10);
          
          if (category && category !== "all") {
            if (elixhauserCategory !== category) {
              continue;
            }
          }
          
          results.push({
            icd10,
            icd9Codes,
            elixhauserCategory
          });
        }
      }

      if (results.length >= 50) break;
    }

    return results.sort((a, b) => {
      const aStartsWith = a.icd10.toUpperCase().startsWith(queryUpper);
      const bStartsWith = b.icd10.toUpperCase().startsWith(queryUpper);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.icd10.localeCompare(b.icd10);
    });
  }
}

export const storage = new MemStorage();
