import { SearchResult } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassificationBadge } from "./ClassificationBadge";
import { Card } from "@/components/ui/card";

interface ResultsTableProps {
  results: SearchResult[];
  onCategoryClick?: (category: string) => void;
}

export function ResultsTable({ results, onCategoryClick }: ResultsTableProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Código ICD10</TableHead>
                <TableHead className="font-semibold">Código(s) ICD9</TableHead>
                <TableHead className="font-semibold">Clasificación ELIXHAUSER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={`${result.icd10}-${index}`}
                  className="hover-elevate"
                  data-testid={`row-result-${index}`}
                >
                  <TableCell className="font-mono font-medium text-base" data-testid={`text-icd10-${index}`}>
                    {result.icd10}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground" data-testid={`text-icd9-${index}`}>
                    {result.icd9Codes.join(", ")}
                  </TableCell>
                  <TableCell>
                    <ClassificationBadge 
                      category={result.elixhauserCategory}
                      onClick={onCategoryClick}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {results.map((result, index) => (
          <Card
            key={`${result.icd10}-${index}`}
            className="p-4 space-y-3 hover-elevate"
            data-testid={`card-result-${index}`}
          >
            <div>
              <p className="text-sm text-muted-foreground mb-1">Código ICD10</p>
              <p className="font-mono font-medium text-lg" data-testid={`text-icd10-mobile-${index}`}>
                {result.icd10}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Código(s) ICD9</p>
              <p className="font-mono text-muted-foreground" data-testid={`text-icd9-mobile-${index}`}>
                {result.icd9Codes.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Clasificación ELIXHAUSER</p>
              <ClassificationBadge 
                category={result.elixhauserCategory}
                onClick={onCategoryClick}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
