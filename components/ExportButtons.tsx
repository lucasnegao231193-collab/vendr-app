/**
 * Export Buttons Component
 * Botões para exportar dados em PDF e CSV
 */
"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: any[];
  filename: string;
  title: string;
  columns: Array<{ header: string; key: string }>;
}

export function ExportButtons({ data, filename, title, columns }: ExportButtonsProps) {
  const { toast } = useToast();

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      
      // Data
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 30);
      
      // Tabela
      const tableData = data.map((item) =>
        columns.map((col) => item[col.key] || "-")
      );
      
      autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 87, 255] },
      });
      
      doc.save(`${filename}.pdf`);
      
      toast({
        title: "✓ PDF Exportado!",
        description: "Download iniciado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    try {
      // Cabeçalhos
      const headers = columns.map((col) => col.header).join(",");
      
      // Dados
      const rows = data.map((item) =>
        columns.map((col) => {
          const value = item[col.key] || "-";
          // Escapar valores com vírgula
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        }).join(",")
      );
      
      const csv = [headers, ...rows].join("\n");
      
      // Download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      
      toast({
        title: "✓ CSV Exportado!",
        description: "Download iniciado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar CSV",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Exportar PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        className="gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
}
