/**
 * Página de CRUD de produtos
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  unidade: string;
  marca?: string | null;
  ativo: boolean;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState(0);
  const [unidade, setUnidade] = useState("un");
  const [marca, setMarca] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativo" | "inativo">("todos");

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome");

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Buscar empresa_id do usuário
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) throw new Error("Perfil não encontrado");

      if (editingId) {
        // Atualizar
        const { error } = await supabase
          .from("produtos")
          .update({ nome, preco, unidade, marca: marca || null })
          .eq("id", editingId);

        if (error) throw error;

        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        // Criar
        const { error } = await supabase.from("produtos").insert({
          nome,
          preco,
          unidade,
          marca: marca || null,
          empresa_id: perfil.empresa_id,
        });

        if (error) throw error;

        toast({ title: "Produto criado com sucesso!" });
      }

      resetForm();
      loadProdutos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingId(produto.id);
    setNome(produto.nome);
    setPreco(produto.preco);
    setUnidade(produto.unidade);
    setMarca(produto.marca || "");
    setShowForm(true);
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase.from("produtos").update({ ativo: !ativo }).eq("id", id);

      if (error) throw error;

      toast({
        title: ativo ? "Produto desativado" : "Produto ativado",
      });
      loadProdutos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNome("");
    setPreco(0);
    setUnidade("un");
    setMarca("");
    setEditingId(null);
    setShowForm(false);
  };

  const produtosFiltrados = produtos.filter((p) => {
    const matchMarca = !filtroMarca || p.marca?.toLowerCase().includes(filtroMarca.toLowerCase());
    const matchAtivo =
      filtroAtivo === "todos" ||
      (filtroAtivo === "ativo" && p.ativo) ||
      (filtroAtivo === "inativo" && !p.ativo);
    return matchMarca && matchAtivo;
  });

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Produtos</h1>
          <Button onClick={() => setShowForm(!showForm)} className="vendr-btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Editar Produto" : "Novo Produto"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Sorvete Chocolate"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Ex: Kibon"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={preco}
                      onChange={(e) => setPreco(parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade *</Label>
                    <Input
                      id="unidade"
                      value={unidade}
                      onChange={(e) => setUnidade(e.target.value)}
                      placeholder="Ex: un, kg, L"
                      required
                    />
                  </div>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Produtos</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Filtrar por marca..."
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value)}
                  className="w-48"
                />
                <select
                  value={filtroAtivo}
                  onChange={(e) => setFiltroAtivo(e.target.value as any)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{produto.marca || "-"}</TableCell>
                    <TableCell>{formatCurrency(produto.preco)}</TableCell>
                    <TableCell>{produto.unidade}</TableCell>
                    <TableCell>
                      <Badge variant={produto.ativo ? "default" : "outline"}>
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={produto.ativo ? "destructive" : "default"}
                          size="icon"
                          onClick={() => handleToggleAtivo(produto.id, produto.ativo)}
                        >
                          {produto.ativo ? (
                            <Trash2 className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
