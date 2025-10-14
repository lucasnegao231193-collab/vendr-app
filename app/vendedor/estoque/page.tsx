/**
 * Página: /vendedor/estoque
 * Visualiza estoque próprio e solicita devoluções
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, RotateCcw, TrendingUp, DollarSign } from "lucide-react";
import { VendedorLayout } from "@/components/VendedorLayout";
import { VendedorStockList } from "@/components/transferencias/VendedorStockList";
import { ReturnRequestForm } from "@/components/transferencias/ReturnRequestForm";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase-browser";

export default function VendedorEstoquePage() {
  const [estoque, setEstoque] = useState<any[]>([]);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItens: 0,
    totalProdutos: 0,
    valorEstimado: 0,
  });
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadEstoque();
  }, []);

  const loadEstoque = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar vendedor
      const { data: vendedor } = await supabase
        .from('vendedores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!vendedor) return;

      // Buscar estoque
      const { data: estoqueData } = await supabase
        .from('vendedor_estoque')
        .select(`
          *,
          produto:produtos(id, nome, preco)
        `)
        .eq('vendedor_id', vendedor.id)
        .gt('quantidade', 0);

      setEstoque(estoqueData || []);

      // Calcular stats
      const totalItens = estoqueData?.reduce((sum, item) => sum + item.quantidade, 0) || 0;
      const totalProdutos = estoqueData?.length || 0;
      const valorEstimado = estoqueData?.reduce((sum, item) => sum + (item.quantidade * (item.produto?.preco || 0)), 0) || 0;

      setStats({ totalItens, totalProdutos, valorEstimado });
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o estoque",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSuccess = () => {
    setShowReturnForm(false);
    loadEstoque();
    toast({
      title: "Sucesso!",
      description: "Solicitação de devolução enviada à empresa",
    });
  };

  return (
    <VendedorLayout>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Meu Estoque
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus produtos e solicite devoluções
            </p>
          </div>
          
          {estoque.length > 0 && !showReturnForm && (
            <Button onClick={() => setShowReturnForm(true)} className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Solicitar Devolução
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                Total de Itens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalItens}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalProdutos} produtos diferentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Produtos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalProdutos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                Valor Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                R$ {stats.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Devolução */}
        {showReturnForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Solicitar Devolução</CardTitle>
              <CardDescription>
                Selecione os produtos que deseja devolver à empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnRequestForm
                onSuccess={handleReturnSuccess}
                onCancel={() => setShowReturnForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Lista de Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Estoque</CardTitle>
            <CardDescription>
              Visualize todos os produtos disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <VendedorStockList estoque={estoque} />
            )}
          </CardContent>
        </Card>
      </div>
    </VendedorLayout>
  );
}
