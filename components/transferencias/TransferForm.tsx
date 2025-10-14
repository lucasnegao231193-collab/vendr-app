/**
 * TransferForm - Formulário para criar transferência
 * Empresa seleciona vendedor, produtos e envia
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

interface Produto {
  id: string;
  nome: string;
  sku: string;
  preco: number;
  estoque_disponivel: number;
}

interface ItemCarrinho {
  produtoId: string;
  produto: Produto;
  quantidade: number;
}

interface TransferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedVendedor, setSelectedVendedor] = useState("");
  const [selectedProduto, setSelectedProduto] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadVendedores();
    loadProdutos();
  }, []);

  const loadVendedores = async () => {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!perfil) return;

    const { data } = await supabase
      .from('vendedores')
      .select('id, nome, email')
      .eq('empresa_id', perfil.empresa_id)
      .eq('ativo', true)
      .order('nome');

    setVendedores(data || []);
  };

  const loadProdutos = async () => {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!perfil) return;

    // Buscar produtos com estoque disponível da tabela estoques
    const { data: estoquesData, error } = await supabase
      .from('estoques')
      .select(`
        qtd,
        produto_id,
        produtos:produto_id (
          id,
          nome,
          preco
        )
      `)
      .eq('empresa_id', perfil.empresa_id)
      .gt('qtd', 0)
      .order('produtos(nome)');

    if (error) {
      console.error('Erro ao carregar produtos:', error);
      return;
    }

    const produtosComEstoque = estoquesData?.map((e: any) => ({
      id: e.produtos.id,
      nome: e.produtos.nome,
      sku: `PROD-${e.produtos.id.substring(0, 8)}`,
      preco: e.produtos.preco,
      estoque_disponivel: e.qtd,
    })) || [];

    setProdutos(produtosComEstoque);
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

    const produto = produtos.find(p => p.id === selectedProduto);
    if (!produto) return;

    // Verificar se já está no carrinho
    const existente = carrinho.find(item => item.produtoId === selectedProduto);
    if (existente) {
      toast({
        title: "Produto já adicionado",
        description: "Remova o item e adicione novamente com a quantidade desejada",
        variant: "destructive",
      });
      return;
    }

    // Verificar estoque
    if (quantidade > produto.estoque_disponivel) {
      toast({
        title: "Estoque insuficiente",
        description: `Disponível: ${produto.estoque_disponivel} unidades`,
        variant: "destructive",
      });
      return;
    }

    setCarrinho([...carrinho, {
      produtoId: selectedProduto,
      produto,
      quantidade,
    }]);

    setSelectedProduto("");
    setQuantidade(1);
  };

  const handleRemoveItem = (produtoId: string) => {
    setCarrinho(carrinho.filter(item => item.produtoId !== produtoId));
  };

  const handleSubmit = async () => {
    if (!selectedVendedor) {
      toast({
        title: "Selecione um vendedor",
        variant: "destructive",
      });
      return;
    }

    if (carrinho.length === 0) {
      toast({
        title: "Adicione pelo menos 1 produto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/transferencias/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedorId: selectedVendedor,
          itens: carrinho.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
          observacao,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar transferência');
      }

      toast({
        title: "Sucesso!",
        description: data.message,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar transferência:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a transferência",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <div className="space-y-6">
      {/* Selecionar Vendedor */}
      <div className="space-y-2">
        <Label htmlFor="vendedor">Vendedor *</Label>
        <Select value={selectedVendedor} onValueChange={setSelectedVendedor}>
          <SelectTrigger id="vendedor">
            <SelectValue placeholder="Selecione o vendedor" />
          </SelectTrigger>
          <SelectContent>
            {vendedores.map(v => (
              <SelectItem key={v.id} value={v.id}>
                {v.nome} ({v.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Adicionar Produtos */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Adicionar Produtos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="produto">Produto</Label>
            <Select value={selectedProduto} onValueChange={setSelectedProduto}>
              <SelectTrigger id="produto">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} - SKU: {p.sku} (Estoque: {p.estoque_disponivel})
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
              <Button 
                onClick={handleAddItem} 
                type="button"
                className="bg-primary hover:bg-primary/90 text-white gap-2 min-w-[120px]"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          💡 Selecione o produto e quantidade, depois clique em "Adicionar" para incluir no carrinho
        </p>
      </div>

      {/* Carrinho */}
      {carrinho.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Itens da Transferência</h3>
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
        <Label htmlFor="observacao">Observação (opcional)</Label>
        <Textarea
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Adicione informações adicionais sobre esta transferência"
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
              Enviar Transferência
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
