import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="loading-state">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Buscando códigos...</p>
    </div>
  );
}
