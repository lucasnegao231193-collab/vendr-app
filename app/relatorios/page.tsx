/**
 * Página de relatórios com filtros e exportação CSV
 */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Filter } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { exportarVendasCSV } from "@/lib/db";

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleFiltrar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendas")
        .select(
          `
          *,
          vendedores (nome),
          produtos (nome)
        `
        )
        .gte("data_hora", `${dataInicio}T00:00:00`)
        .lte("data_hora", `${dataFim}T23:59:59`)
        .order("data_hora", { ascending: false });

      if (error) throw error;
      setVendas(data || []);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = exportarVendasCSV(vendas);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `vendas_${dataInicio}_${dataFim}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalGeral = vendas.reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-inicio">Data Início</Label>
                  <Input
                    id="data-inicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-fim">Data Fim</Label>
                  <Input
                    id="data-fim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleFiltrar} disabled={loading} className="w-full vendr-btn-primary">
                    <Filter className="h-4 w-4 mr-2" />
                    {loading ? "Buscando..." : "Filtrar"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        {vendas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total de Vendas</p>
                  <p className="text-3xl font-bold">{vendas.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(totalGeral)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-3xl font-bold text-secondary">
                    {formatCurrency(totalGeral / vendas.length)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de vendas */}
        {vendas.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vendas ({vendas.length})</CardTitle>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor Unit</TableHead>
                    <TableHead>Meio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>{formatDateTime(venda.data_hora)}</TableCell>
                      <TableCell>{venda.vendedores?.nome || "-"}</TableCell>
                      <TableCell>{venda.produtos?.nome || "-"}</TableCell>
                      <TableCell>{venda.qtd}</TableCell>
                      <TableCell>{formatCurrency(venda.valor_unit)}</TableCell>
                      <TableCell className="uppercase">{venda.meio_pagamento}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(venda.qtd * venda.valor_unit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {vendas.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <p>Nenhuma venda encontrada no período selecionado.</p>
                <p className="text-sm">Ajuste os filtros e tente novamente.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
