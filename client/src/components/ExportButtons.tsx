import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { SearchResult } from "@shared/schema";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  results: SearchResult[];
  searchQuery: string;
  searchMode: string;
  categoryFilter?: string;
}

export function ExportButtons({ results, searchQuery, searchMode, categoryFilter }: ExportButtonsProps) {
  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ["Código ICD-10", "Código ICD-9", "Categoría ELIXHAUSER", "Categorías Múltiples"];
    
    const metadataLines = [
      "=== METADATA ===",
      `Fecha de exportación: ${new Date().toLocaleString("es-ES")}`,
      `Búsqueda: ${searchQuery}`,
      `Modo: ${searchMode === "inverse" ? "ICD9 → ICD10" : "ICD10 → ICD9"}`,
      `Categoría filtrada: ${categoryFilter && categoryFilter !== "all" ? categoryFilter : "Todas"}`,
      `Total de resultados: ${results.length}`,
      "",
      "=== RESULTADOS ==="
    ];

    const rows = results.flatMap(result => 
      result.icd9Codes.map(icd9 => [
        result.icd10,
        icd9,
        result.elixhauserCategory || "No clasificado",
        result.elixhauserCategories?.join(", ") || ""
      ])
    );

    const csvContent = metadataLines.join("\n") + "\n" + 
                      Papa.unparse({ fields: headers, data: rows });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `icd_conversion_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (results.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("ICD Code Converter", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text("Conversión de Códigos Médicos con Clasificación ELIXHAUSER", 14, 29);
    
    doc.setFontSize(9);
    doc.setTextColor(73, 80, 87);
    doc.text(`Fecha: ${new Date().toLocaleString("es-ES")}`, 14, 40);
    doc.text(`Búsqueda: ${searchQuery}`, 14, 45);
    doc.text(`Modo: ${searchMode === "inverse" ? "ICD9 → ICD10" : "ICD10 → ICD9"}`, 14, 50);
    doc.text(`Categoría: ${categoryFilter && categoryFilter !== "all" ? categoryFilter : "Todas"}`, 14, 55);
    doc.text(`Total de resultados: ${results.length}`, 14, 60);
    
    const tableData = results.flatMap(result =>
      result.icd9Codes.map(icd9 => [
        result.icd10,
        icd9,
        result.elixhauserCategory || "No clasificado",
        result.elixhauserCategories?.slice(1).join(", ") || "-"
      ])
    );

    autoTable(doc, {
      startY: 68,
      head: [["ICD-10", "ICD-9", "Categoría Principal", "Otras Categorías"]],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 68, left: 14, right: 14 },
    });

    doc.save(`icd_conversion_${Date.now()}.pdf`);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="gap-2"
        data-testid="button-export-csv"
      >
        <FileText className="h-4 w-4" />
        Exportar CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="gap-2"
        data-testid="button-export-pdf"
      >
        <Download className="h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  );
}
