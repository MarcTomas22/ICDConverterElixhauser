import fs from "fs";
import path from "path";
import { CodeConversion } from "@shared/schema";

export async function loadConversions(): Promise<Map<string, CodeConversion[]>> {
  const csvPath = path.join(process.cwd(), "attached_assets", "ICD_9_10_d_v1.1_1760516226717.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n");
  
  const conversionsMap = new Map<string, CodeConversion[]>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split("|");
    if (parts.length >= 2) {
      const icd10 = parts[0].trim();
      const icd9 = parts[1].trim();
      const flags = parts[2]?.trim();
      
      if (icd10 && icd9) {
        if (!conversionsMap.has(icd10)) {
          conversionsMap.set(icd10, []);
        }
        conversionsMap.get(icd10)!.push({
          icd10,
          icd9,
          flags
        });
      }
    }
  }
  
  return conversionsMap;
}
