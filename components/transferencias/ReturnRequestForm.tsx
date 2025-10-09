/**
 * ReturnRequestForm - Formulário de solicitação de devolução
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

interface ItemDevolucao {
  produtoId: string;
  produto: any;
  quantidade: number;
}

interface ReturnRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReturnRequestForm({ onSuccess, onCancel }: ReturnRequestFormProps) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [selectedProduto, setSelectedProduto] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState<ItemDevolucao[]>([]);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadEstoque();
  }, []);

  const loadEstoque = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Buscar vendedor
    const { data: vendedor } = await supabase
      .from('vendedores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!vendedor) return;

    // Buscar estoque do vendedor
    const { data: estoque } = await supabase
      .from('vendedor_estoque')
      .select(`
        produto_id,
        quantidade,
        produto:produtos(id, nome, sku)
      `)
      .eq('vendedor_id', vendedor.id)
      .gt('quantidade', 0);

    setProdutos(estoque || []);
  };

  const handleAddItem = () => {
    if (!selectedProduto) {
      toast({
        title: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    if (quantidade <= 0) {
      toast({
        title: "Quantidade inválida",
        variant: "destructive",
      });
      return;
    }

    const produtoEstoque = produtos.find(p => p.produto_id === selectedProduto);
    if (!produtoEstoque) return;

    // Verificar se já está no carrinho
    if (carrinho.find(item => item.produtoId === selectedProduto)) {
      toast({
        title: "Produto já adicionado",
        description: "Remova e adicione novamente com a quantidade desejada",
        variant: "destructive",
      });
      return;
    }

    // Verificar estoque disponível
    if (quantidade > produtoEstoque.quantidade) {
      toast({
        title: "Quantidade insuficiente",
        description: `Você possui apenas ${produtoEstoque.quantidade} unidades`,
        variant: "destructive",
      });
      return;
    }

    setCarrinho([...carrinho, {
      produtoId: selectedProduto,
      produto: produtoEstoque.produto,
      quantidade,
    }]);

    setSelectedProduto("");
    setQuantidade(1);
  };

  const handleRemoveItem = (produtoId: string) => {
    setCarrinho(carrinho.filter(item => item.produtoId !== produtoId));
  };

  const handleSubmit = async () => {
    if (carrinho.length === 0) {
      toast({
        title: "Adicione pelo menos 1 produto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/devolucoes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: carrinho.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
          observacao,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar devolução');
      }

      toast({
        title: "Sucesso!",
        description: data.message,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <div className="space-y-6">
      {/* Adicionar Produtos */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Produtos para Devolução</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="produto">Produto</Label>
            <Select value={selectedProduto} onValueChange={setSelectedProduto}>
              <SelectTrigger id="produto">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map(p => (
                  <SelectItem key={p.produto_id} value={p.produto_id}>
                    {p.produto?.nome} - SKU: {p.produto?.sku} (Você tem: {p.quantidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantidade">Quantidade</Label>
            <div className="flex gap-2">
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              />
              <Button onClick={handleAddItem} type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Carrinho */}
      {carrinho.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Itens da Devolução</h3>
            <span className="text-sm text-muted-foreground">
              Total: {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="space-y-2">
            {carrinho.map(item => (
              <div
                key={item.produtoId}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.produto.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {item.produto.sku} | Quantidade: {item.quantidade}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.produtoId)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observação */}
      <div className="space-y-2">
        <Label htmlFor="observacao">Motivo da Devolução (opcional)</Label>
        <Textarea
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex: Produtos com defeito, excesso de estoque..."
          rows={3}
        />
      </div>

      {/* Ações */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Solicitar Devolução
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
