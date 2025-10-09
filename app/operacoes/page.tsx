/**
 * Página de operações do dia + fechamento
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CloseDayDialog } from "@/components/CloseDayDialog";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { calcularTotaisVendedor } from "@/lib/db";
import { CheckCircle } from "lucide-react";

interface Vendedor {
  id: string;
  nome: string;
  comissao_padrao: number;
}

export default function OperacoesPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingVendedor, setClosingVendedor] = useState<Vendedor | null>(null);
  const [closePreview, setClosePreview] = useState<any>(null);

  const supabase = createClient();
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vendedoresRes, vendasRes] = await Promise.all([
        supabase.from("vendedores").select("*").eq("ativo", true).order("nome"),
        supabase
          .from("vendas")
          .select(
            `
            *,
            vendedores (nome),
            produtos (nome)
          `
          )
          .gte("data_hora", `${hoje}T00:00:00`)
          .lte("data_hora", `${hoje}T23:59:59`)
          .order("data_hora", { ascending: false }),
      ]);

      setVendedores(vendedoresRes.data || []);
      setVendas(vendasRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClose = async (vendedor: Vendedor) => {
    setClosingVendedor(vendedor);

    // Calcular preview
    const totais = await calcularTotaisVendedor(vendedor.id, hoje, false);
    const comissaoEstimada = totais.total * vendedor.comissao_padrao;

    setClosePreview({
      ...totais,
      comissao_estimada: comissaoEstimada,
    });
  };

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Operações do Dia</h1>
          <p className="text-[var(--text-secondary)]">Gerencie fechamentos e vendas</p>
        </div>

        {/* Resumo por vendedor */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle>Vendedores - Fechar Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendedores.map((vendedor) => {
                  const vendasVendedor = vendas.filter((v) => v.vendedor_id === vendedor.id);
                  const total = vendasVendedor.reduce(
                    (acc, v) => acc + v.qtd * v.valor_unit,
                    0
                  );

                  return (
                    <TableRow key={vendedor.id}>
                      <TableCell className="font-medium">{vendedor.nome}</TableCell>
                      <TableCell>{vendasVendedor.length}</TableCell>
                      <TableCell>{formatCurrency(total)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleOpenClose(vendedor)}
                          disabled={vendasVendedor.length === 0}
                          className="bg-[var(--brand-primary)] text-white"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Fechar Dia
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Vendas do dia */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle>Vendas de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={5} columns={7} />
            ) : vendas.length === 0 ? (
              <EmptyState
                icon={<CheckCircle className="h-12 w-12" />}
                title="Nenhuma venda registrada hoje"
                description="As vendas do dia aparecerão aqui."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Meio</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>
                        {new Date(venda.data_hora).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{venda.vendedores?.nome}</TableCell>
                      <TableCell>{venda.produtos?.nome}</TableCell>
                      <TableCell>{venda.qtd}</TableCell>
                      <TableCell>{formatCurrency(venda.valor_unit)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{venda.meio_pagamento}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(venda.qtd * venda.valor_unit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de fechamento */}
        {closingVendedor && (
          <CloseDayDialog
            open={!!closingVendedor}
            onOpenChange={(open) => {
              if (!open) {
                setClosingVendedor(null);
                setClosePreview(null);
              }
            }}
            vendedorId={closingVendedor.id}
            vendedorNome={closingVendedor.nome}
            data={hoje}
            preview={closePreview}
            onConfirm={() => {
              loadData();
            }}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
