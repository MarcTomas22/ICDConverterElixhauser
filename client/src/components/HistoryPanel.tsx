import { useQuery, useMutation } from "@tanstack/react-query";
import { SearchHistory } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRightLeft, X, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { MouseEvent } from "react";

interface HistoryPanelProps {
  onSelectHistory: (query: string, searchType: string, category?: string) => void;
}

export function HistoryPanel({ onSelectHistory }: HistoryPanelProps) {
  const { toast } = useToast();
  const { data: history = [], isLoading, isError, error, refetch, isFetching } = useQuery<SearchHistory[]>({
    queryKey: ['/api/history'],
    staleTime: 60_000,
  });

  const { mutate: deleteHistory } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Historial actualizado",
        description: "La búsqueda se eliminó correctamente.",
      });
    },
    onError: (mutationError) => {
      const message = mutationError instanceof Error ? mutationError.message : 'No se pudo eliminar la búsqueda del historial.';
      toast({
        title: "Error al eliminar",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (e: MouseEvent, id: number) => {
    e.stopPropagation();
    deleteHistory(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "No se pudo cargar el historial.";
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial
          </CardTitle>
          <CardDescription>
            Reintenta la operación para ver tus búsquedas recientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Error al cargar el historial</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} disabled={isFetching}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial
          </CardTitle>
          <CardDescription>
            Tus búsquedas recientes aparecerán aquí
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial
        </CardTitle>
        <CardDescription>
          Tus últimas {history.length} búsquedas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistory(item.searchQuery, item.searchType, item.categoryFilter || undefined)}
                className="group flex items-center justify-between p-3 rounded-lg border border-border hover-elevate cursor-pointer"
                data-testid={`history-item-${item.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono font-semibold truncate">
                      {item.searchQuery}
                    </code>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {item.searchType === "inverse" ? (
                        <span className="flex items-center gap-1">
                          <ArrowRightLeft className="h-3 w-3" />
                          ICD9→ICD10
                        </span>
                      ) : (
                        "ICD10→ICD9"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(item.createdAt), { 
                        addSuffix: true,
                        locale: es 
                      })}
                    </span>
                    {item.categoryFilter && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.categoryFilter}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => handleDelete(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  data-testid={`button-delete-history-${item.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
