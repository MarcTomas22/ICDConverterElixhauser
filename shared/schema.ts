import { z } from "zod";

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
});

export type CodeConversion = z.infer<typeof codeConversionSchema>;
export type ElixhauserCategory = z.infer<typeof elixhauserCategorySchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
