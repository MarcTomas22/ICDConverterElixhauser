import * as fs from 'fs';
import * as path from 'path';
import { CMR_CATEGORY_NAMES } from './cmr-category-names';

interface CMRCategoryData {
  [categoryCode: string]: string[];
}

let cmrData: CMRCategoryData | null = null;
let codeToCategories: Map<string, string[]> | null = null;

function normalizeICD10Code(code: string): string {
  return code.toUpperCase().trim().replace(/\./g, '');
}

export function loadCMRData() {
  if (cmrData) return cmrData;
  
  const filePath = path.join(process.cwd(), 'server', 'cmr-categories.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  cmrData = JSON.parse(jsonData);
  
  codeToCategories = new Map();
  
  if (cmrData) {
    for (const [categoryCode, codes] of Object.entries(cmrData)) {
      for (const code of codes) {
        const normalizedCode = normalizeICD10Code(code);
        if (!codeToCategories.has(normalizedCode)) {
          codeToCategories.set(normalizedCode, []);
        }
        codeToCategories.get(normalizedCode)!.push(categoryCode);
      }
    }
  }
  
  const categoryCount = cmrData ? Object.keys(cmrData).length : 0;
  console.log(`Loaded CMR data: ${categoryCount} categories, ${codeToCategories.size} unique codes`);
  
  return cmrData;
}

export function findCMRCategories(icd10Code: string): string[] {
  if (!codeToCategories) {
    loadCMRData();
  }
  
  const normalizedCode = normalizeICD10Code(icd10Code);
  const categoryCodes = codeToCategories!.get(normalizedCode) || [];
  
  return categoryCodes.map(code => CMR_CATEGORY_NAMES[code] || code);
}

export function getAllCMRCategoryNames(): string[] {
  if (!cmrData) {
    loadCMRData();
  }
  
  if (!cmrData) return [];
  
  return Object.keys(cmrData)
    .map(code => CMR_CATEGORY_NAMES[code] || code)
    .sort();
}

export function getCMRCategoryCode(categoryName: string): string | null {
  const entry = Object.entries(CMR_CATEGORY_NAMES).find(([_, name]) => name === categoryName);
  return entry ? entry[0] : null;
}
