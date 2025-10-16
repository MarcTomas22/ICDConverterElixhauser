import assert from "node:assert/strict";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://local:local@localhost:5432/mock";
}

async function main(): Promise<void> {
  const { storage } = await import("../storage");

  await storage.initialize();

  const checks = [
    {
      description: "ICD10 forward search for 'E10' returns more than 50 results",
      run: () => storage.searchCodes("E10"),
      minimum: 50,
    },
    {
      description: "ICD9 inverse search for '250' returns more than 50 results",
      run: () => storage.searchCodesInverse("250"),
      minimum: 50,
    },
  ] as const;

  for (const check of checks) {
    const results = await check.run();
    assert(
      results.length > check.minimum,
      `${check.description}. Se esperaban más de ${check.minimum} resultados, pero se obtuvieron ${results.length}.`,
    );
    console.log(`✔️  ${check.description}: ${results.length} resultados`);
  }

  console.log("✅ Verificación de búsqueda completada correctamente");
}

void main();
