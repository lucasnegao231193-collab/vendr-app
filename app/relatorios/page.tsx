/**
 * Página de relatórios com filtros, tabs e exportação CSV
 * VENDR V2 - Design atualizado com animações
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Filter, X, BarChart3, TrendingUp, DollarSign, ArrowLeft, Home } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { exportarVendasCSV } from "@/lib/db";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { AnimatedCard } from "@/components/ui/animated";

export default function RelatoriosPage() {
  const router = useRouter();
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

  const handleLimpar = () => {
    const hoje = new Date().toISOString().split("T")[0];
    setDataInicio(hoje);
    setDataFim(hoje);
    setVendas([]);
  };

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header com Navegação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
              aria-label="Ir para Dashboard"
            >
              <Home className="h-4 w-4" />
              Início
            </Button>
          </div>
        </div>

        {/* Título */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e exporte relatórios de vendas, transferências e comissões
          </p>
        </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="vendas" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="vendas" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="transferencias" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Transferências
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Comissões
          </TabsTrigger>
        </TabsList>

        {/* TAB: Vendas */}
        <TabsContent value="vendas" className="space-y-6">
          {/* Filtros */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#0A66FF]" />
                Filtros de Período
              </CardTitle>
              <CardDescription>
                Selecione o período para visualizar as vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Button 
                    onClick={handleFiltrar} 
                    disabled={loading} 
                    className="w-full bg-[#0A66FF] hover:bg-[#0052CC]"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {loading ? "Buscando..." : "Filtrar"}
                  </Button>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleLimpar} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo */}
          {vendas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-[#0A66FF]">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-medium">Total de Vendas</p>
                    <p className="text-4xl font-bold text-[#0A66FF] mt-2">{vendas.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#FF6B00]">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-medium">Valor Total</p>
                    <p className="text-4xl font-bold text-[#FF6B00] mt-2">
                      {formatCurrency(totalGeral)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#22C55E]">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-medium">Ticket Médio</p>
                    <p className="text-4xl font-bold text-[#22C55E] mt-2">
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
                  <div>
                    <CardTitle>Vendas Realizadas</CardTitle>
                    <CardDescription>{vendas.length} vendas no período selecionado</CardDescription>
                  </div>
                  <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
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

          {/* Empty State */}
          {vendas.length === 0 && !loading && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhuma venda encontrada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ajuste os filtros de período e clique em "Filtrar" para buscar vendas
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: Transferências (Placeholder) */}
        <TabsContent value="transferencias" className="space-y-6">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Relatório de Transferências
                </p>
                <p className="text-sm text-muted-foreground">
                  Em breve: visualize todas as transferências de estoque entre empresa e vendedores
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Comissões (Placeholder) */}
        <TabsContent value="comissoes" className="space-y-6">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <DollarSign className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Relatório de Comissões
                </p>
                <p className="text-sm text-muted-foreground">
                  Em breve: acompanhe comissões pagas e pendentes de todos os vendedores
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
