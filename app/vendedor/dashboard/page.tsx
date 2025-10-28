/**
 * Dashboard do Vendedor com Metas e Progresso
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VendedorLayout } from "@/components/VendedorLayout";
import { formatCurrency } from "@/lib/utils";
import {
  Target,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Venda {
  id: string;
  qtd: number;
  valor_unit: number;
  data_hora: string;
  produtos: {
    nome: string;
  };
}

interface Meta {
  id: string;
  valor_meta: number;
  data: string;
}

export default function VendedorDashboardPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [vendedorId, setVendedorId] = useState<string>("");
  const [comissaoPadrao, setComissaoPadrao] = useState(0.1);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Buscar vendedor do usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: vendedorData } = await supabase
        .from("vendedores")
        .select("id, comissao_padrao")
        .eq("user_id", user.id)
        .single();

      if (!vendedorData) return;

      setVendedorId(vendedorData.id);
      setComissaoPadrao(vendedorData.comissao_padrao);

      // Buscar vendas do dia
      const { data: vendasData } = await supabase
        .from("vendas")
        .select(`
          id,
          qtd,
          valor_unit,
          data_hora,
          produtos (
            nome
          )
        `)
        .eq("vendedor_id", vendedorData.id)
        .gte("data_hora", `${hoje}T00:00:00`)
        .lte("data_hora", `${hoje}T23:59:59`)
        .eq("status", "confirmado")
        .order("data_hora", { ascending: false });

      // Buscar meta do dia
      const { data: metaData } = await supabase
        .from("metas_vendedores")
        .select("*")
        .eq("vendedor_id", vendedorData.id)
        .eq("data", hoje)
        .single();

      setVendas((vendasData as any) || []);
      setMeta(metaData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos
  const totalVendido = vendas.reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);
  const comissaoAcumulada = totalVendido * comissaoPadrao;
  const metaAtingida = meta ? (totalVendido / meta.valor_meta) * 100 : 0;
  const faltaParaMeta = meta ? Math.max(0, meta.valor_meta - totalVendido) : 0;

  const getMetaColor = () => {
    if (metaAtingida >= 100) return "text-green-600";
    if (metaAtingida >= 80) return "text-yellow-600";
    return "text-blue-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <VendedorLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Meu Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe seu desempenho e metas
          </p>
        </div>

        {/* Meta do Dia */}
        {meta && (
          <Card className="border-2 border-[#0057FF]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Meta Diária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso</span>
                <span className={`text-lg font-bold ${getMetaColor()}`}>
                  {metaAtingida.toFixed(1)}%
                </span>
              </div>
              
              <Progress value={Math.min(metaAtingida, 100)} className="h-3" />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Meta</p>
                  <p className="text-xl font-bold">{formatCurrency(meta.valor_meta)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vendido</p>
                  <p className="text-xl font-bold text-[#0057FF]">
                    {formatCurrency(totalVendido)}
                  </p>
                </div>
              </div>

              {metaAtingida < 100 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Falta {formatCurrency(faltaParaMeta)}</strong> para atingir sua meta!
                  </p>
                </div>
              )}

              {metaAtingida >= 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>🎉 Parabéns!</strong> Você atingiu sua meta diária!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Vendido Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0057FF]">
                {formatCurrency(totalVendido)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Comissão Acumulada
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(comissaoAcumulada)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(comissaoPadrao * 100).toFixed(0)}% das vendas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendas.length}</div>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Performance */}
        {metaAtingida >= 80 && metaAtingida < 100 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Você está quase lá!
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Você atingiu {metaAtingida.toFixed(0)}% da sua meta. Continue assim!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas (Hoje)</CardTitle>
          </CardHeader>
          <CardContent>
            {vendas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma venda registrada hoje</p>
                <Button asChild className="mt-4">
                  <Link href="/vendedor/vender">Registrar Primeira Venda</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vendas.map((venda) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{venda.produtos.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(venda.data_hora).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" • "}
                          {venda.qtd} unidades
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(venda.qtd * venda.valor_unit)}
                      </p>
                      <p className="text-xs text-green-600">
                        +{formatCurrency(venda.qtd * venda.valor_unit * comissaoPadrao)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild size="lg" className="h-20">
            <Link href="/vendedor/vender" className="flex flex-col gap-1">
              <Package className="h-6 w-6" />
              <span>Registrar Venda</span>
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="h-20">
            <Link href="/vendedor/estoque" className="flex flex-col gap-1">
              <Package className="h-6 w-6" />
              <span>Meu Estoque</span>
            </Link>
          </Button>
        </div>
      </div>
    </VendedorLayout>
  );
}
