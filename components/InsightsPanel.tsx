/**
 * Painel de Insights Inteligentes
 * Alertas automáticos sobre vendedores, estoque e produtos
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  UserX,
  Sparkles,
} from "lucide-react";

interface Insight {
  tipo: "alerta" | "sucesso" | "info";
  icone: any;
  titulo: string;
  mensagem: string;
}

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const insightsGerados: Insight[] = [];

      // 1. Vendedores ociosos (sem venda há 2+ dias)
      const { data: vendedoresOciosos } = await supabase
        .from("vendedores")
        .select(`
          id,
          nome,
          vendas (
            data_hora
          )
        `)
        .eq("ativo", true);

      const hoje = new Date();
      vendedoresOciosos?.forEach((vendedor: any) => {
        const ultimaVenda = vendedor.vendas?.[0]?.data_hora;
        if (!ultimaVenda || 
            (hoje.getTime() - new Date(ultimaVenda).getTime()) > 2 * 24 * 60 * 60 * 1000) {
          const diasSemVenda = ultimaVenda 
            ? Math.floor((hoje.getTime() - new Date(ultimaVenda).getTime()) / (24 * 60 * 60 * 1000))
            : "mais de 30";
          
          insightsGerados.push({
            tipo: "alerta",
            icone: UserX,
            titulo: "Vendedor Ocioso",
            mensagem: `O vendedor ${vendedor.nome} não registrou vendas há ${diasSemVenda} dias.`,
          });
        }
      });

      // 2. Estoque baixo (< 5 unidades)
      const { data: estoqueBaixo } = await supabase
        .from("estoques")
        .select(`
          qtd,
          produtos (
            nome
          )
        `)
        .lt("qtd", 5)
        .limit(3);

      estoqueBaixo?.forEach((item: any) => {
        insightsGerados.push({
          tipo: "alerta",
          icone: Package,
          titulo: "Estoque Baixo",
          mensagem: `${item.produtos.nome} possui apenas ${item.qtd} unidades em estoque.`,
        });
      });

      // 3. Produto mais vendido do mês
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        .toISOString()
        .split("T")[0];

      const { data: produtosMaisVendidos } = await supabase
        .from("vendas")
        .select(`
          produto_id,
          qtd,
          produtos (
            nome
          )
        `)
        .gte("data_hora", `${primeiroDiaMes}T00:00:00`)
        .eq("status", "confirmado");

      if (produtosMaisVendidos && produtosMaisVendidos.length > 0) {
        const produtosMap = new Map<string, { nome: string; total: number }>();
        
        produtosMaisVendidos.forEach((venda: any) => {
          const key = venda.produto_id;
          const current = produtosMap.get(key);
          
          if (current) {
            current.total += venda.qtd;
          } else {
            produtosMap.set(key, {
              nome: venda.produtos.nome,
              total: venda.qtd,
            });
          }
        });

        const topProduto = Array.from(produtosMap.values())
          .sort((a, b) => b.total - a.total)[0];

        if (topProduto) {
          insightsGerados.push({
            tipo: "sucesso",
            icone: TrendingUp,
            titulo: "Produto Mais Vendido",
            mensagem: `${topProduto.nome} é o produto mais vendido do mês com ${topProduto.total} unidades.`,
          });
        }
      }

      // 4. Insight de crescimento
      const { data: vendasHoje } = await supabase
        .from("vendas")
        .select("qtd, valor_unit")
        .gte("data_hora", `${hoje.toISOString().split("T")[0]}T00:00:00`)
        .eq("status", "confirmado");

      const totalHoje = vendasHoje?.reduce((acc, v) => acc + v.qtd * v.valor_unit, 0) || 0;

      if (totalHoje > 1000) {
        insightsGerados.push({
          tipo: "sucesso",
          icone: Sparkles,
          titulo: "Ótimo Desempenho!",
          mensagem: `Você já faturou R$ ${totalHoje.toFixed(2)} hoje. Continue assim!`,
        });
      }

      setInsights(insightsGerados);
    } catch (error) {
      console.error("Erro ao carregar insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum insight disponível no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Insights Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icone;
          const variant = insight.tipo === "alerta" ? "destructive" : "default";

          return (
            <Alert key={index} variant={variant as any}>
              <Icon className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{insight.titulo}</p>
                    <p className="text-sm mt-1">{insight.mensagem}</p>
                  </div>
                  {insight.tipo === "alerta" && (
                    <Badge variant="destructive">Atenção</Badge>
                  )}
                  {insight.tipo === "sucesso" && (
                    <Badge className="bg-green-600">Top</Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}
