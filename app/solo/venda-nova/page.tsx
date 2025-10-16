/**
 * Nova Venda - Modo Solo
 * Fluxo simplificado para registrar vendas
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, ShoppingCart, CreditCard, DollarSign, Smartphone, Package, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface Produto {
  id: string;
  nome: string;
  marca?: string;
  preco: number;
  estoque_atual: number;
  unidade: string;
}

interface Servico {
  id: string;
  nome: string;
  categoria: string;
  valor_unitario: number;
  descricao?: string;
}

type TipoVenda = 'produto' | 'servico';

export default function SoloVendaNovaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tipoVenda, setTipoVenda] = useState<TipoVenda>('produto');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao' | 'dinheiro' | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');

  useEffect(() => {
    loadProdutos();
    loadServicos();
  }, []);

  const loadProdutos = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServicos = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/solo/servicos?user_id=${user.id}&ativo=true`);
      const result = await response.json();
      
      if (response.ok) {
        setServicos(result.servicos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const alterarQuantidade = (produtoId: string, delta: number) => {
    setQuantidades(prev => {
      const atual = prev[produtoId] || 0;
      const novo = Math.max(0, atual + delta);
      
      // Verificar estoque
      const produto = produtos.find(p => p.id === produtoId);
      if (produto && novo > produto.estoque_atual) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${produto.estoque_atual} disponíveis`,
          variant: "destructive",
        });
        return prev;
      }
      
      return { ...prev, [produtoId]: novo };
    });
  };

  const calcularTotal = () => {
    if (tipoVenda === 'produto') {
      return produtos.reduce((total, produto) => {
        const qtd = quantidades[produto.id] || 0;
        return total + (qtd * produto.preco);
      }, 0);
    } else {
      return servicos.reduce((total, servico) => {
        const qtd = quantidades[servico.id] || 0;
        return total + (qtd * servico.valor_unitario);
      }, 0);
    }
  };

  const handleConfirmar = async () => {
    // Validações
    const itens = Object.entries(quantidades)
      .filter(([_, qtd]) => qtd > 0);

    if (itens.length === 0) {
      toast({
        title: tipoVenda === 'produto' ? "Adicione produtos" : "Adicione serviços",
        description: tipoVenda === 'produto' ? "Selecione pelo menos um produto" : "Selecione pelo menos um serviço",
        variant: "destructive",
      });
      return;
    }

    if (!metodoPagamento) {
      toast({
        title: "Selecione o método de pagamento",
        variant: "destructive",
      });
      return;
    }

    setSalvando(true);

    try {
      if (tipoVenda === 'produto') {
        // Venda de produtos
        const response = await fetch('/api/solo/vendas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itens: itens.map(([produto_id, qtd]) => ({ produto_id, qtd })),
            metodo_pagamento: metodoPagamento,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.upgrade_required) {
            toast({
              title: "Limite mensal atingido",
              description: data.message,
              variant: "destructive",
              action: (
                <Button 
                  size="sm"
                  onClick={() => router.push('/solo/assinatura')}
                >
                  Fazer Upgrade
                </Button>
              ),
            });
            return;
          }
          throw new Error(data.error || 'Erro ao registrar venda');
        }

        toast({
          title: "✓ Venda registrada!",
          description: `Total: ${formatCurrency(data.valor_total)}`,
        });
      } else {
        // Venda de serviços
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        // Mapear método de pagamento para o formato do banco
        const metodoPagamentoMap: Record<string, string> = {
          'pix': 'PIX',
          'cartao': 'Credito',
          'dinheiro': 'Dinheiro',
        };

        for (const [servico_id, quantidade] of itens) {
          const servico = servicos.find(s => s.id === servico_id);
          if (!servico) continue;

          const response = await fetch('/api/solo/vendas-servicos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              servico_id,
              cliente_nome: clienteNome || undefined,
              cliente_telefone: clienteTelefone || undefined,
              quantidade,
              valor_unitario: servico.valor_unitario,
              metodo_pagamento: metodoPagamentoMap[metodoPagamento] || 'Outros',
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao registrar venda de serviço');
          }
        }

        toast({
          title: "✓ Venda de serviço registrada!",
          description: `Total: ${formatCurrency(calcularTotal())}`,
        });
      }

      // Limpar formulário
      setQuantidades({});
      setMetodoPagamento(null);
      setClienteNome('');
      setClienteTelefone('');
      
      // Recarregar dados
      if (tipoVenda === 'produto') {
        loadProdutos();
      }

    } catch (error: any) {
      toast({
        title: "Erro ao registrar venda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const total = calcularTotal();
  const temItens = Object.values(quantidades).some(q => q > 0);

  const metodosPagamento = [
    { id: 'pix', label: 'PIX', icon: Smartphone, color: 'bg-green-500' },
    { id: 'cartao', label: 'Cartão', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'dinheiro', label: 'Dinheiro', icon: DollarSign, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 pb-32 space-y-6">
        <Breadcrumbs />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#121212]">Nova Venda</h1>
          <p className="text-gray-600">Selecione o tipo de venda</p>
        </motion.div>

        {/* Botões de Seleção: Produtos ou Serviços */}
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setTipoVenda('produto');
              setQuantidades({});
            }}
            className={`flex-1 h-20 text-lg ${
              tipoVenda === 'produto'
                ? 'bg-[#0057FF] hover:bg-[#0046CC] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Package className="h-6 w-6 mr-3" />
            Produtos
          </Button>
          <Button
            onClick={() => {
              setTipoVenda('servico');
              setQuantidades({});
            }}
            className={`flex-1 h-20 text-lg ${
              tipoVenda === 'servico'
                ? 'bg-[#FF6600] hover:bg-[#FF6600]/90 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Wrench className="h-6 w-6 mr-3" />
            Serviços
          </Button>
        </div>

        {/* Campos de Cliente (apenas para serviços) */}
        {tipoVenda === 'servico' && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Telefone</label>
                <input
                  type="tel"
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Produtos */}
        {tipoVenda === 'produto' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtos.map((produto, index) => {
            const qtd = quantidades[produto.id] || 0;
            const subtotal = qtd * produto.preco;

            return (
              <motion.div
                key={produto.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{produto.nome}</CardTitle>
                    {produto.marca && (
                      <p className="text-sm text-gray-500">{produto.marca}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#0057FF]">
                          {formatCurrency(produto.preco)}
                        </span>
                        <Badge variant="outline">
                          {produto.estoque_atual} {produto.unidade}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => alterarQuantidade(produto.id, -1)}
                          disabled={qtd === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xl font-semibold w-12 text-center">
                          {qtd}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => alterarQuantidade(produto.id, 1)}
                          disabled={qtd >= produto.estoque_atual}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {qtd > 0 && (
                        <div className="text-center text-sm text-gray-600">
                          Subtotal: <span className="font-semibold">{formatCurrency(subtotal)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Grid de Serviços */}
        {tipoVenda === 'servico' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicos.map((servico, index) => {
            const qtd = quantidades[servico.id] || 0;
            const subtotal = qtd * servico.valor_unitario;

            return (
              <motion.div
                key={servico.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-[#FF6600]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{servico.nome}</CardTitle>
                    <Badge variant="outline">{servico.categoria}</Badge>
                    {servico.descricao && (
                      <p className="text-sm text-gray-500 mt-1">{servico.descricao}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#FF6600]">
                          {formatCurrency(servico.valor_unitario)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => alterarQuantidade(servico.id, -1)}
                          disabled={qtd === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xl font-semibold w-12 text-center">
                          {qtd}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => alterarQuantidade(servico.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {qtd > 0 && (
                        <div className="text-center text-sm text-gray-600">
                          Subtotal: <span className="font-semibold">{formatCurrency(subtotal)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Empty State */}
        {tipoVenda === 'produto' && produtos.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-gray-600 mb-4">
                Adicione produtos ao estoque para começar a vender
              </p>
              <Button onClick={() => router.push('/solo/estoque')}>
                Adicionar Produtos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Serviços */}
        {tipoVenda === 'servico' && servicos.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-gray-600 mb-4">
                Cadastre os serviços que você oferece para começar a vender
              </p>
              <Button onClick={() => router.push('/solo/servicos')} className="bg-[#FF6600] hover:bg-[#FF6600]/90">
                Cadastrar Serviços
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Barra Inferior Fixa */}
        {temItens && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg z-40"
          >
            <div className="max-w-6xl mx-auto space-y-4">
              {/* Métodos de Pagamento */}
              <div className="flex gap-2 justify-center">
                {metodosPagamento.map(metodo => (
                  <Button
                    key={metodo.id}
                    variant={metodoPagamento === metodo.id ? "default" : "outline"}
                    onClick={() => setMetodoPagamento(metodo.id as any)}
                    className="flex-1"
                  >
                    <metodo.icon className="h-4 w-4 mr-2" />
                    {metodo.label}
                  </Button>
                ))}
              </div>

              {/* Total e Confirmar */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-[#0057FF]">
                    {formatCurrency(total)}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleConfirmar}
                  disabled={!metodoPagamento || salvando}
                  className="bg-[#0057FF] hover:bg-[#0046CC] text-white px-8"
                >
                  {salvando ? 'Processando...' : 'Confirmar Venda'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
}
