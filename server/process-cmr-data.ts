import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface CMRMapping {
  icd10: string;
  category: string;
  description?: string;
}

function processCMRFile() {
  const filePath = path.join(process.cwd(), 'attached_assets', 'CMR-Reference-File-v2025-1_1760533108985.xlsx');
  
  console.log('Reading CMR Excel file...');
  const workbook = XLSX.readFile(filePath);
  
  console.log('Sheet names:', workbook.SheetNames);
  
  const sheetName = 'DX_to_Comorb_Mapping';
  const worksheet = workbook.Sheets[sheetName];
  
  if (!worksheet) {
    console.error(`Sheet "${sheetName}" not found`);
    return;
  }
  
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  console.log('\nTotal rows:', data.length);
  
  const headers = data[1] as string[];
  console.log('\nHeaders:', headers.slice(0, 10), '... and', headers.length - 10, 'more');
  
  const categoryColumns: { [key: string]: number } = {};
  for (let i = 3; i < headers.length; i++) {
    const header = headers[i];
    if (header && typeof header === 'string') {
      categoryColumns[header] = i;
    }
  }
  
  console.log('\nCategory columns found:', Object.keys(categoryColumns).length);
  console.log('Categories:', Object.keys(categoryColumns).slice(0, 10).join(', '), '...');
  
  const categoryGroups: { [key: string]: string[] } = {};
  Object.keys(categoryColumns).forEach(cat => {
    categoryGroups[cat] = [];
  });
  
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const icd10Code = row[0] ? row[0].toString().trim() : '';
    const description = row[1] ? row[1].toString().trim() : '';
    
    if (!icd10Code) continue;
    
    for (const [category, columnIndex] of Object.entries(categoryColumns)) {
      const value = row[columnIndex];
      if (value === 1 || value === '1') {
        categoryGroups[category].push(icd10Code);
      }
    }
  }
  
  console.log('\nProcessed categories:');
  Object.entries(categoryGroups).forEach(([cat, codes]) => {
    if (codes.length > 0) {
      console.log(`- ${cat}: ${codes.length} codes`);
    }
  });
  
  const outputPath = path.join(process.cwd(), 'server', 'cmr-categories.json');
  fs.writeFileSync(outputPath, JSON.stringify(categoryGroups, null, 2));
  console.log(`\nWrote categories to: ${outputPath}`);
}

processCMRFile();
