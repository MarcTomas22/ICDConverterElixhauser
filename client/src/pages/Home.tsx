import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchResult } from "@shared/schema";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTable } from "@/components/ResultsTable";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDebounce } from "@/hooks/useDebounce";
import { Activity } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${debouncedSearchTerm}`],
    enabled: debouncedSearchTerm.length >= 2,
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setHasSearched(false);
  };

  const isTyping = searchTerm !== debouncedSearchTerm && searchTerm.length >= 2;
  const showLoading = isLoading || isTyping;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold" data-testid="text-app-title">
                  ICD Code Converter
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Conversión ICD10 a ICD9 con Clasificación ELIXHAUSER
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center space-y-2 mb-4">
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Herramienta profesional para convertir códigos médicos ICD10 a ICD9
                con clasificación automática de comorbilidades ELIXHAUSER
              </p>
            </div>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onClear={handleClear}
            />
          </div>

          <div className="max-w-7xl mx-auto">
            {showLoading ? (
              <LoadingState />
            ) : results.length > 0 ? (
              <ResultsTable results={results} />
            ) : (
              <EmptyState hasSearched={hasSearched} />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Base de datos con {(261000).toLocaleString()} conversiones ICD10 → ICD9
          </p>
        </div>
      </footer>
    </div>
  );
}
