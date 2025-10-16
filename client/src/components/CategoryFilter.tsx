import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { toast } = useToast();
  const { data: categories = [], isError, error } = useQuery<string[]>({
    queryKey: ["/api/categories"],
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError && error) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar las categorías.";
      toast({
        title: "Error al cargar categorías",
        description: message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange} disabled={isError}>
        <SelectTrigger className="w-[280px]" data-testid="select-category-filter">
          <SelectValue placeholder="Filtrar por categoría ELIXHAUSER" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" data-testid="option-category-all">
            Todas las categorías
          </SelectItem>
          {categories.map((category) => (
            <SelectItem
              key={category}
              value={category}
              data-testid={`option-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && value !== "all" && (
        <button
          onClick={() => onChange("all")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-clear-category"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
