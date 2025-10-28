/**
 * Página de Vendas - Menu Empresa
 * Histórico de todas as vendas da empresa
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Filter, Download, ShoppingCart } from "lucide-react";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Venda {
  id: string;
  data_hora: string;
  qtd: number;
  valor_unit: number;
  meio_pagamento: string;
  status: string;
  produtos: {
    nome: string;
    marca?: string;
  };
  vendedores: {
    nome: string;
  };
}

export default function VendasPage() {
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const supabase = createClient();

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) return;

      let query = supabase
        .from("vendas")
        .select(`
          id,
          data_hora,
          qtd,
          valor_unit,
          meio_pagamento,
          status,
          produtos (
            nome,
            marca
          ),
          vendedores (
            nome
          )
        `)
        .eq("empresa_id", perfil.empresa_id)
        .order("data_hora", { ascending: false });

      // Aplicar filtros
      if (dataInicio) {
        query = query.gte("data_hora", `${dataInicio}T00:00:00`);
      }
      if (dataFim) {
        query = query.lte("data_hora", `${dataFim}T23:59:59`);
      }
      if (filtroMetodo) {
        query = query.eq("meio_pagamento", filtroMetodo);
      }
      if (filtroStatus) {
        query = query.eq("status", filtroStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVendas((data as any) || []);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setLoading(true);
    loadVendas();
  };

  const limparFiltros = () => {
    setDataInicio("");
    setDataFim("");
    setFiltroMetodo("");
    setFiltroStatus("");
    setLoading(true);
    loadVendas();
  };

  const calcularTotal = () => {
    return vendas
      .filter((v) => v.status === "confirmado")
      .reduce((sum, v) => sum + v.qtd * v.valor_unit, 0);
  };

  const getMetodoBadgeColor = (metodo: string) => {
    switch (metodo) {
      case "pix":
        return "bg-green-100 text-green-800";
      case "cartao":
        return "bg-blue-100 text-blue-800";
      case "dinheiro":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "cancelado":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Vendas</h1>
          <p className="text-[var(--text-secondary)]">
            Histórico completo de vendas da empresa
          </p>
        </div>

        {/* Filtros */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Início</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Fim</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Método</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={filtroMetodo}
                  onChange={(e) => setFiltroMetodo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={aplicarFiltros} className="flex-1 vendr-btn-primary">
                  Aplicar
                </Button>
                <Button onClick={limparFiltros} variant="outline">
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold">{vendas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calcularTotal())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      vendas.length > 0 ? calcularTotal() / vendas.length : 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Vendas */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle>Lista de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={10} columns={7} />
            ) : vendas.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma venda encontrada</p>
                <Button onClick={limparFiltros} variant="outline">
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>
                        {new Date(venda.data_hora).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{venda.produtos.nome}</p>
                          {venda.produtos.marca && (
                            <p className="text-xs text-gray-500">
                              {venda.produtos.marca}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{venda.vendedores.nome}</TableCell>
                      <TableCell>{venda.qtd}</TableCell>
                      <TableCell>{formatCurrency(venda.valor_unit)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(venda.qtd * venda.valor_unit)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getMetodoBadgeColor(venda.meio_pagamento)}>
                          {venda.meio_pagamento.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(venda.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
