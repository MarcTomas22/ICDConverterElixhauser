import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  hasSearched: boolean;
}

export function EmptyState({ hasSearched }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {hasSearched ? "No se encontraron resultados" : "Buscar un código ICD10"}
      </h3>
      <p className="text-muted-foreground text-center max-w-md">
        {hasSearched
          ? "Intenta con otro código o verifica la ortografía"
          : "Introduce un código ICD10 para ver su conversión a ICD9 y clasificación ELIXHAUSER"}
      </p>
    </div>
  );
}
