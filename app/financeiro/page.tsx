/**
 * Módulo Financeiro: Faturamento, Lucro, Comissões, Despesas
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  LineChart as LineChartIcon,
} from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface VendaFinanceiro {
  id: string;
  qtd: number;
  valor_unit: number;
  meio_pagamento: string;
  data_hora: string;
  vendedor_id: string;
  vendedores: {
    comissao_padrao: number;
  };
}

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  pago: boolean;
}

export default function FinanceiroPage() {
  const [vendas, setVendas] = useState<VendaFinanceiro[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Buscar empresa_id do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) return;
      const empresaId = perfil.empresa_id;

      const hoje = new Date().toISOString().split("T")[0];
      const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0];

      // Buscar vendas do mês
      const { data: vendasData } = await supabase
        .from("vendas")
        .select(`
          id,
          qtd,
          valor_unit,
          meio_pagamento,
          data_hora,
          vendedor_id,
          vendedores (
            comissao_padrao
          )
        `)
        .eq("empresa_id", empresaId)
        .gte("data_hora", `${primeiroDiaMes}T00:00:00`)
        .eq("status", "confirmado");

      // Buscar despesas do mês
      const { data: despesasData } = await supabase
        .from("despesas")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("data", primeiroDiaMes)
        .order("data", { ascending: false });

      setVendas((vendasData as any) || []);
      setDespesas((despesasData as any) || []);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const faturamentoTotal = vendas.reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);
  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
  const lucroEstimado = faturamentoTotal - totalDespesas;

  const comissoesAPagar = vendas.reduce((acc, v) => {
    const valorVenda = v.qtd * v.valor_unit;
    const comissao = valorVenda * v.vendedores.comissao_padrao;
    return acc + comissao;
  }, 0);

  // Por forma de pagamento
  const totalPix = vendas
    .filter((v) => v.meio_pagamento === "pix")
    .reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);

  const totalDinheiro = vendas
    .filter((v) => v.meio_pagamento === "dinheiro")
    .reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);

  const totalCartao = vendas
    .filter((v) => v.meio_pagamento === "cartao")
    .reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);

  // Dados para gráfico de pizza
  const pieData = [
    { name: "PIX", value: totalPix, color: "#0057FF" },
    { name: "Dinheiro", value: totalDinheiro, color: "#10B981" },
    { name: "Cartão", value: totalCartao, color: "#FF6B00" },
  ].filter((item) => item.value > 0);

  // Dados para gráfico de linha (últimos 7 dias)
  const getDailyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map((date) => {
      const vendasDia = vendas.filter((v) =>
        v.data_hora.startsWith(date)
      );
      const total = vendasDia.reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);

      return {
        data: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        valor: total,
      };
    });
  };

  const lineData = getDailyData();

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Financeiro</h1>
          <p className="text-[var(--text-secondary)]">Análise financeira completa</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0057FF]">
                {formatCurrency(faturamentoTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Faturamento - Despesas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF6B00]">
                {formatCurrency(comissoesAPagar)}
              </div>
              <p className="text-xs text-muted-foreground">
                Vendas confirmadas
              </p>
              <p className="text-xs text-muted-foreground">Vendas confirmadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalDespesas)}
              </div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linha: Faturamento Diário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Faturamento Diário (Últimos 7 Dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: "#000" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#0057FF"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pizza: Formas de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown por Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0057FF]" />
                <span className="text-sm font-medium">PIX</span>
              </div>
              <span className="text-lg font-semibold">{formatCurrency(totalPix)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-sm font-medium">Dinheiro</span>
              </div>
              <span className="text-lg font-semibold">{formatCurrency(totalDinheiro)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B00]" />
                <span className="text-sm font-medium">Cartão</span>
              </div>
              <span className="text-lg font-semibold">{formatCurrency(totalCartao)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Despesas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {despesas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma despesa registrada
                </p>
              ) : (
                despesas.slice(0, 5).map((despesa) => (
                  <div key={despesa.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{despesa.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {despesa.categoria} • {new Date(despesa.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(despesa.valor)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
