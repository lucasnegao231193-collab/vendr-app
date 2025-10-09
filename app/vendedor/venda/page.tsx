/**
 * Página de nova venda do vendedor
 * Com suporte offline
 */
"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductGrid } from "@/components/ProductGrid";
import { PixModal } from "@/components/PixModal";
import { useToast } from "@/components/ui/use-toast";
import { useOfflineSync } from "@/store/offlineQueue";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, DollarSign, Smartphone, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type MeioPagamento = "pix" | "cartao" | "dinheiro";

export default function VendaPage() {
  const [vendedorId, setVendedorId] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [meioPagamento, setMeioPagamento] = useState<MeioPagamento | null>(null);
  const [valorRecebido, setValorRecebido] = useState(0);
  const [showPixModal, setShowPixModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();
  const { addToQueue, isOnline } = useOfflineSync();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
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

      if (vendedorData) {
        setVendedorId(vendedorData.id);
      }

      const { data: produtosData } = await supabase
        .from("produtos")
        .select("*")
        .eq("empresa_id", perfil.empresa_id)
        .eq("ativo", true)
        .order("nome");

      setProdutos(produtosData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleQuantidadeChange = (produtoId: string, delta: number) => {
    setQuantidades((prev) => {
      const newQtd = Math.max(0, (prev[produtoId] || 0) + delta);
      return { ...prev, [produtoId]: newQtd };
    });
  };

  const calcularTotal = () => {
    return Object.entries(quantidades).reduce((acc, [produtoId, qtd]) => {
      const produto = produtos.find((p) => p.id === produtoId);
      return acc + (produto ? produto.preco * qtd : 0);
    }, 0);
  };

  const handleConfirmarVenda = async () => {
    if (!meioPagamento) {
      toast({
        title: "Selecione o meio de pagamento",
        variant: "destructive",
      });
      return;
    }

    const total = calcularTotal();

    if (meioPagamento === "dinheiro" && valorRecebido < total) {
      toast({
        title: "Valor recebido insuficiente",
        variant: "destructive",
      });
      return;
    }

    if (meioPagamento === "pix") {
      setShowPixModal(true);
      return;
    }

    await finalizarVenda();
  };

  const finalizarVenda = async () => {
    setLoading(true);

    try {
      const vendasParaSalvar = Object.entries(quantidades)
        .filter(([_, qtd]) => qtd > 0)
        .map(([produtoId, qtd]) => {
          const produto = produtos.find((p) => p.id === produtoId);
          return {
            vendedor_id: vendedorId,
            produto_id: produtoId,
            qtd,
            valor_unit: produto.preco,
            meio_pagamento: meioPagamento!,
            status: "confirmado" as const,
          };
        });

      if (isOnline) {
        // Tentar salvar online
        for (const venda of vendasParaSalvar) {
          const response = await fetch("/api/vendas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(venda),
          });

          if (!response.ok) {
            throw new Error("Erro ao salvar venda");
          }
        }

        toast({
          title: "✓ Venda registrada!",
          description: "Venda salva com sucesso",
        });
      } else {
        // Salvar offline
        for (const venda of vendasParaSalvar) {
          await addToQueue(venda);
        }

        toast({
          title: "✓ Venda salva offline",
          description: "Será sincronizada quando conectar",
        });
      }

      // Resetar formulário
      setQuantidades({});
      setMeioPagamento(null);
      setValorRecebido(0);

      // Voltar para home após 1s
      setTimeout(() => router.push("/vendedor"), 1000);
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast({
        title: "Erro ao registrar venda",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const total = calcularTotal();
  const troco = meioPagamento === "dinheiro" ? (valorRecebido - total) : 0;
  const temItens = Object.values(quantidades).some((q) => q > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Nova Venda</h1>
        </div>

        {/* Produtos */}
        <ProductGrid
          produtos={produtos}
          quantidades={quantidades}
          onQuantidadeChange={handleQuantidadeChange}
        />

        {/* Resumo e Pagamento */}
        {temItens && (
          <Card className="sticky bottom-4 shadow-lg border-2">
            <CardHeader>
              <CardTitle>Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-center text-primary">
                Total: {formatCurrency(total)}
              </div>

              {/* Meios de pagamento */}
              <div className="space-y-2">
                <Label>Meio de Pagamento</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={meioPagamento === "pix" ? "default" : "outline"}
                    className="h-16 flex-col gap-1"
                    onClick={() => setMeioPagamento("pix")}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span>PIX</span>
                  </Button>

                  <Button
                    variant={meioPagamento === "cartao" ? "default" : "outline"}
                    className="h-16 flex-col gap-1"
                    onClick={() => setMeioPagamento("cartao")}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Cartão</span>
                  </Button>

                  <Button
                    variant={meioPagamento === "dinheiro" ? "default" : "outline"}
                    className="h-16 flex-col gap-1"
                    onClick={() => setMeioPagamento("dinheiro")}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Dinheiro</span>
                  </Button>
                </div>
              </div>

              {/* Campo de dinheiro */}
              {meioPagamento === "dinheiro" && (
                <div className="space-y-2">
                  <Label htmlFor="recebido">Valor Recebido</Label>
                  <Input
                    id="recebido"
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorRecebido}
                    onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                    className="text-xl"
                  />
                  {valorRecebido >= total && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                      <p className="text-sm text-green-700">Troco:</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(troco)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmar */}
              <Button
                onClick={handleConfirmarVenda}
                disabled={loading || !meioPagamento}
                className="w-full h-14 text-lg vendr-btn-primary"
              >
                {loading ? "Processando..." : "Confirmar Venda"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal PIX */}
        <PixModal
          open={showPixModal}
          onOpenChange={setShowPixModal}
          valor={total}
          onConfirm={finalizarVenda}
        />
      </div>
    </div>
  );
}
