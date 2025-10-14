/**
 * Gestão de Estoque - Modo Solo
 * CRUD de produtos e controle de estoque
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import { Package, Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { TableSkeleton } from "@/components/LoadingSkeleton";

interface Produto {
  id: string;
  nome: string;
  marca?: string;
  preco: number;
  estoque_atual: number;
  unidade: string;
  ativo: boolean;
}

export default function SoloEstoquePage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState("");
  const [estoqueInicial, setEstoqueInicial] = useState("");
  const [unidade, setUnidade] = useState("UN");

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      // Buscar empresa_id do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        setLoading(false);
        return;
      }

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) {
        console.error('Perfil não encontrado');
        setLoading(false);
        return;
      }

      // Buscar apenas produtos da empresa do usuário
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('empresa_id', perfil.empresa_id)
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User:', user);
      console.log('User Error:', userError);
      
      if (!user) {
        console.error('Usuário não autenticado. Session:', await supabase.auth.getSession());
        throw new Error("Não autenticado");
      }

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) throw new Error("Perfil não encontrado");

      const produtoData = {
        nome,
        marca: marca || null,
        preco: parseFloat(preco),
        unidade,
        empresa_id: perfil.empresa_id,
      };

      if (editingId) {
        // Atualizar produto
        const { error } = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "✓ Produto atualizado!" });
      } else {
        // Criar produto
        const { error } = await supabase
          .from('produtos')
          .insert({
            ...produtoData,
            estoque_atual: parseInt(estoqueInicial) || 0,
          });

        if (error) throw error;
        toast({ title: "✓ Produto criado!" });
      }

      resetForm();
      loadProdutos();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingId(produto.id);
    setNome(produto.nome);
    setMarca(produto.marca || "");
    setPreco(produto.preco.toString());
    setUnidade(produto.unidade);
    setShowForm(true);
  };

  const handleDelete = async (produto: Produto) => {
    const confirm = window.confirm(`Deseja excluir "${produto.nome}"?`);
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', produto.id);

      if (error) throw error;

      toast({ title: "✓ Produto excluído!" });
      loadProdutos();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNome("");
    setMarca("");
    setPreco("");
    setEstoqueInicial("");
    setUnidade("UN");
    setEditingId(null);
    setShowForm(false);
  };

  // Calcular totais
  const totalProdutos = produtos.length;
  const produtosAtivos = produtos.filter(p => p.ativo).length;
  const valorTotalEstoque = produtos.reduce(
    (sum, p) => sum + (p.estoque_atual * p.preco),
    0
  );
  const totalUnidades = produtos.reduce((sum, p) => sum + p.estoque_atual, 0);

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        <Breadcrumbs />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#121212]">Estoque</h1>
            <p className="text-gray-600">Gerencie seus produtos</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#0057FF] hover:bg-[#0046CC] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          )}
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total de Produtos</p>
              <p className="text-2xl font-bold">{totalProdutos}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Produtos Ativos</p>
              <p className="text-2xl font-bold text-green-600">{produtosAtivos}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total Unidades</p>
              <p className="text-2xl font-bold text-blue-600">{totalUnidades}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Valor em Estoque</p>
              <p className="text-2xl font-bold text-[#0057FF]">
                {formatCurrency(valorTotalEstoque)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Editar Produto" : "Novo Produto"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      placeholder="Ex: Refrigerante"
                    />
                  </div>
                  <div>
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Ex: Coca-Cola"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade</Label>
                    <select
                      id="unidade"
                      value={unidade}
                      onChange={(e) => setUnidade(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border"
                    >
                      <option value="UN">Unidade (UN)</option>
                      <option value="CX">Caixa (CX)</option>
                      <option value="KG">Quilograma (KG)</option>
                      <option value="L">Litro (L)</option>
                    </select>
                  </div>
                  {!editingId && (
                    <div>
                      <Label htmlFor="estoque">Estoque Inicial</Label>
                      <Input
                        id="estoque"
                        type="number"
                        min="0"
                        value={estoqueInicial}
                        onChange={(e) => setEstoqueInicial(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="vendr-btn-primary">
                    {editingId ? "Atualizar" : "Criar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {produtos.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Nenhum produto cadastrado</p>
                <Button onClick={() => setShowForm(true)}>
                  Adicionar Primeiro Produto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {produtos.map((produto, index) => (
                  <motion.div
                    key={produto.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{produto.nome}</h3>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {produto.marca && (
                        <p className="text-sm text-gray-500">{produto.marca}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-semibold text-[#0057FF]">
                          {formatCurrency(produto.preco)}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          produto.estoque_atual < 10 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          <Package className="h-4 w-4" />
                          {produto.estoque_atual} {produto.unidade}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(produto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(produto)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
