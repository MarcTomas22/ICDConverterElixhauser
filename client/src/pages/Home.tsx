import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SearchResult } from "@shared/schema";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTable } from "@/components/ResultsTable";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CategoryFilter } from "@/components/CategoryFilter";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { useDebounce } from "@/hooks/useDebounce";
import { Activity, ArrowRightLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";

type SearchMode = "normal" | "inverse";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchMode, setSearchMode] = useState<SearchMode>("normal");
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const categoryParam = selectedCategory && selectedCategory !== "all" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
  const modeParam = searchMode === "inverse" ? "&mode=inverse" : "";
  
  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${debouncedSearchTerm}${categoryParam}${modeParam}`],
    enabled: debouncedSearchTerm.length >= 2,
  });

  const saveHistoryMutation = useMutation({
    mutationFn: async (data: { searchQuery: string; searchType: string; categoryFilter?: string }) => {
      await apiRequest('POST', '/api/history', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
    },
  });

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && results.length > 0) {
      saveHistoryMutation.mutate({
        searchQuery: debouncedSearchTerm,
        searchType: searchMode,
        categoryFilter: selectedCategory !== "all" ? selectedCategory : undefined,
      });
    }
  }, [debouncedSearchTerm, searchMode, selectedCategory, results.length]);

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

  const handleModeChange = (value: string) => {
    setSearchMode(value as SearchMode);
    setSearchTerm("");
    setHasSearched(false);
  };

  const handleSelectHistory = (query: string, searchType: string, category?: string) => {
    setSearchMode(searchType as SearchMode);
    setSearchTerm(query);
    setSelectedCategory(category || "all");
    setHasSearched(true);
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center space-y-2 mb-4">
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Herramienta profesional para convertir códigos médicos ICD10 a ICD9
                  con clasificación automática de comorbilidades ELIXHAUSER
                </p>
              </div>
              
              <Tabs value={searchMode} onValueChange={handleModeChange} className="w-auto">
                <TabsList data-testid="tabs-search-mode">
                  <TabsTrigger value="normal" data-testid="tab-normal-search" className="gap-2">
                    ICD10 → ICD9
                  </TabsTrigger>
                  <TabsTrigger value="inverse" data-testid="tab-inverse-search" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    ICD9 → ICD10
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <SearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                onClear={handleClear}
                placeholder={
                  searchMode === "inverse" 
                    ? "Buscar código ICD9 (ej: 428.0, 250.00, 332.0)..." 
                    : "Buscar código ICD10 (ej: I50.0, E10.9, G20.x)..."
                }
              />
              <CategoryFilter
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            <div className="max-w-7xl mx-auto">
              {showLoading ? (
                <LoadingState />
              ) : results.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {results.length} {results.length === 1 ? "resultado" : "resultados"}
                      {selectedCategory && selectedCategory !== "all" && (
                        <span> en categoría: <span className="font-medium text-foreground">{selectedCategory}</span></span>
                      )}
                    </div>
                    <ExportButtons
                      results={results}
                      searchQuery={debouncedSearchTerm}
                      searchMode={searchMode}
                      categoryFilter={selectedCategory}
                    />
                  </div>
                  <ResultsTable results={results} />
                </>
              ) : (
                <EmptyState hasSearched={hasSearched} />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <HistoryPanel onSelectHistory={handleSelectHistory} />
            </div>
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
