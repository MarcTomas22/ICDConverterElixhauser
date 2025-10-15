import { z } from "zod";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const codeConversionSchema = z.object({
  icd10: z.string(),
  icd9: z.string(),
  flags: z.string().optional(),
});

export const elixhauserCategorySchema = z.object({
  category: z.string(),
  icd10Codes: z.array(z.string()),
});

export const searchResultSchema = z.object({
  icd10: z.string(),
  icd9Codes: z.array(z.string()),
  elixhauserCategory: z.string().nullable(),
  elixhauserCategories: z.array(z.string()).optional(),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  searchQuery: text("search_query").notNull(),
  searchType: text("search_type").notNull(),
  categoryFilter: text("category_filter"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, createdAt: true });

export type CodeConversion = z.infer<typeof codeConversionSchema>;
export type ElixhauserCategory = z.infer<typeof elixhauserCategorySchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
