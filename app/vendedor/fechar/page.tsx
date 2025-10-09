/**
 * Página de fechamento do dia do vendedor
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { calcularTotaisVendedor } from "@/lib/db";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function FecharDiaPage() {
  const [vendedorId, setVendedorId] = useState("");
  const [vendedorNome, setVendedorNome] = useState("");
  const [totais, setTotais] = useState<any>(null);
  const [comissao, setComissao] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fechando, setFechando] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) return;

      const { data: vendedorData } = await supabase
        .from("vendedores")
        .select("*")
        .eq("empresa_id", perfil.empresa_id)
        .limit(1)
        .single();

      if (!vendedorData) return;

      setVendedorId(vendedorData.id);
      setVendedorNome(vendedorData.nome);

      const totaisData = await calcularTotaisVendedor(vendedorData.id, hoje, false);
      setTotais(totaisData);

      const { data: kit } = await supabase
        .from("kits")
        .select("comissao_percent")
        .eq("vendedor_id", vendedorData.id)
        .eq("data", hoje)
        .single();

      const comissaoPercent = kit?.comissao_percent || vendedorData.comissao_padrao;
      setComissao(totaisData.total * comissaoPercent);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = async () => {
    setFechando(true);
    try {
      const response = await fetch("/api/fechamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendedor_id: vendedorId, data: hoje }),
      });

      if (!response.ok) throw new Error("Erro");

      toast({ title: "✓ Dia fechado!", description: "Até amanhã!" });
      setTimeout(() => router.push("/vendedor"), 2000);
    } catch (error) {
      toast({ title: "Erro", variant: "destructive" });
    } finally {
      setFechando(false);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Fechar Meu Dia</h1>
            <p className="text-muted-foreground">{vendedorNome}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6 border-b">
              <p className="text-sm text-muted-foreground mb-2">Total de Vendas</p>
              <p className="text-5xl font-bold text-primary">{totais?.qtd_vendas || 0}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PIX</span>
                <span className="font-semibold">{formatCurrency(totais?.total_pix || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cartão</span>
                <span className="font-semibold">{formatCurrency(totais?.total_cartao || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dinheiro</span>
                <span className="font-semibold">{formatCurrency(totais?.total_dinheiro || 0)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total Vendido</span>
                <span className="text-primary">{formatCurrency(totais?.total || 0)}</span>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-2">Minha Comissão</p>
                <p className="text-5xl font-bold text-green-700">{formatCurrency(comissao)}</p>
              </div>
            </div>

            <Button
              onClick={handleFechar}
              disabled={fechando || !totais || totais.total === 0}
              className="w-full h-16 text-lg vendr-btn-primary"
            >
              <CheckCircle className="h-6 w-6 mr-2" />
              {fechando ? "Fechando..." : "Confirmar Fechamento"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
