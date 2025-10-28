/**
 * Página de Estoque com KPIs, Filtros e Movimentações
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EditProductDialog } from "@/components/EditProductDialog";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, ArrowUpDown, Download, Edit, MoreVertical, Trash2, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EstoqueItem {
  id: string;
  produto_id: string;
  qtd: number;
  produtos: {
    id: string;
    nome: string;
    marca: string | null;
    preco: number;
    unidade: string;
    ativo: boolean;
  };
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  unidade: string;
  marca?: string | null;
  ativo: boolean;
}

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [filteredEstoque, setFilteredEstoque] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "inativo">("todos");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Estados para gerenciar produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [editingProdutoId, setEditingProdutoId] = useState<string | null>(null);
  const [nomeProduto, setNomeProduto] = useState("");
  const [precoProduto, setPrecoProduto] = useState(0);
  const [unidadeProduto, setUnidadeProduto] = useState("un");
  const [marcaProduto, setMarcaProduto] = useState("");
  const [filtroProdutoMarca, setFiltroProdutoMarca] = useState("");
  const [filtroProdutoAtivo, setFiltroProdutoAtivo] = useState<"todos" | "ativo" | "inativo">("todos");

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadEstoque();
    loadProdutos();
  }, []);

  useEffect(() => {
    filterEstoque();
  }, [busca, filtroMarca, filtroStatus, estoque]);

  const loadEstoque = async () => {
    try {
      // Buscar empresa_id do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) return;

      // Buscar estoque da tabela estoques (não produtos)
      const { data, error } = await supabase
        .from("estoques")
        .select(`
          id,
          produto_id,
          qtd,
          produtos:produto_id (
            id,
            nome,
            marca,
            preco,
            unidade,
            ativo
          )
        `)
        .eq("empresa_id", perfil.empresa_id)
        .order("qtd", { ascending: true });

      if (error) throw error;

      // Transformar para o formato esperado
      const estoqueFormatado = data?.map((e: any) => ({
        id: e.id,
        produto_id: e.produto_id,
        qtd: e.qtd || 0,
        produtos: {
          id: e.produtos.id,
          nome: e.produtos.nome,
          marca: e.produtos.marca,
          preco: e.produtos.preco,
          unidade: e.produtos.unidade,
          ativo: e.produtos.ativo,
        },
      })) || [];

      setEstoque(estoqueFormatado);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEstoque = () => {
    let filtered = [...estoque];

    // Busca por nome
    if (busca) {
      filtered = filtered.filter((item) =>
        item.produtos.nome.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Filtro por marca
    if (filtroMarca !== "todas") {
      filtered = filtered.filter((item) => item.produtos.marca === filtroMarca);
    }

    // Filtro por status
    if (filtroStatus !== "todos") {
      const ativo = filtroStatus === "ativo";
      filtered = filtered.filter((item) => item.produtos.ativo === ativo);
    }

    setFilteredEstoque(filtered);
  };

  // KPIs
  const itensdistintos = estoque.length;
  const unidadesTotais = estoque.reduce((acc, item) => acc + item.qtd, 0);
  const valorTotal = estoque.reduce(
    (acc, item) => acc + item.qtd * item.produtos.preco,
    0
  );

  // Marcas únicas
  const marcas = Array.from(
    new Set(estoque.map((item) => item.produtos.marca).filter(Boolean))
  );

  const handleEdit = (item: EstoqueItem) => {
    setEditingProduct({
      id: item.id,
      produto_id: item.produtos.id,
      nome: item.produtos.nome,
      marca: item.produtos.marca,
      preco: item.produtos.preco,
      qtd: item.qtd,
      ativo: item.produtos.ativo,
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (item: EstoqueItem) => {
    const confirm = window.confirm(
      `Tem certeza que deseja excluir "${item.produtos.nome}"?\n\nIsso removerá o produto do estoque. Esta ação não pode ser desfeita.`
    );

    if (!confirm) return;

    try {
      // Chamar API para deletar (usa service_role para bypass RLS)
      const response = await fetch(`/api/admin/delete-product?id=${item.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar produto');
      }

      toast({
        title: "Produto removido!",
        description: "O item foi excluído do estoque",
      });

      loadEstoque();
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const exportCSV = () => {
    const headers = ["Produto", "Marca", "Preço", "Qtd", "Unidade", "Valor Total"];
    const rows = filteredEstoque.map((item) => [
      item.produtos.nome,
      item.produtos.marca || "-",
      item.produtos.preco.toFixed(2),
      item.qtd,
      item.produtos.unidade,
      (item.qtd * item.produtos.preco).toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estoque_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Funções de gerenciamento de produtos
  const loadProdutos = async () => {
    try {
      // Buscar empresa_id do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) return;

      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, preco, unidade, marca, ativo")
        .eq("empresa_id", perfil.empresa_id)
        .order("nome");

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const handleProdutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) throw new Error("Perfil não encontrado");

      if (editingProdutoId) {
        const { error } = await supabase
          .from("produtos")
          .update({ nome: nomeProduto, preco: precoProduto, unidade: unidadeProduto, marca: marcaProduto || null })
          .eq("id", editingProdutoId);

        if (error) throw error;
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("produtos").insert({
          nome: nomeProduto,
          preco: precoProduto,
          unidade: unidadeProduto,
          marca: marcaProduto || null,
          empresa_id: perfil.empresa_id,
        });

        if (error) throw error;
        toast({ title: "Produto criado com sucesso!" });
      }

      resetProdutoForm();
      loadProdutos();
      loadEstoque();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditProduto = (produto: Produto) => {
    setEditingProdutoId(produto.id);
    setNomeProduto(produto.nome);
    setPrecoProduto(produto.preco);
    setUnidadeProduto(produto.unidade);
    setMarcaProduto(produto.marca || "");
    setShowProdutoForm(true);
  };

  const handleToggleProdutoAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase.from("produtos").update({ ativo: !ativo }).eq("id", id);
      if (error) throw error;
      toast({ title: ativo ? "Produto desativado" : "Produto ativado" });
      loadProdutos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetProdutoForm = () => {
    setNomeProduto("");
    setPrecoProduto(0);
    setUnidadeProduto("un");
    setMarcaProduto("");
    setEditingProdutoId(null);
    setShowProdutoForm(false);
  };

  const produtosFiltrados = produtos.filter((p) => {
    const matchMarca = !filtroProdutoMarca || p.marca?.toLowerCase().includes(filtroProdutoMarca.toLowerCase());
    const matchAtivo =
      filtroProdutoAtivo === "todos" ||
      (filtroProdutoAtivo === "ativo" && p.ativo) ||
      (filtroProdutoAtivo === "inativo" && !p.ativo);
    return matchMarca && matchAtivo;
  });

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Estoque</h1>
            <p className="text-[var(--text-secondary)]">
              Gerencie seu inventário e movimentações
            </p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-[#0D1B2A] hover:bg-[#1a2938] text-white gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            Adicionar ao Estoque
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Itens Distintos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{itensdistintos}</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unidades Totais</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unidadesTotais}</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Total em Estoque
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(valorTotal)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Buscar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="md:col-span-2"
              />

              <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as marcas</SelectItem>
                  {marcas.map((marca) => (
                    <SelectItem key={marca} value={marca || ""}>
                      {marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filtroStatus}
                onValueChange={(v: any) => setFiltroStatus(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
              
              <Button variant="outline" onClick={exportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstoque.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEstoque.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.produtos.nome}
                      </TableCell>
                      <TableCell>{item.produtos.marca || "-"}</TableCell>
                      <TableCell>{formatCurrency(item.produtos.preco)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.qtd < 5 ? "destructive" : "outline"}
                        >
                          {item.qtd}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.produtos.unidade}</TableCell>
                      <TableCell>
                        {formatCurrency(item.qtd * item.produtos.preco)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.produtos.ativo ? "default" : "secondary"}>
                          {item.produtos.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Seção de Produtos */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produtos</CardTitle>
              <Button onClick={() => setShowProdutoForm(!showProdutoForm)} className="vendr-btn-primary gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showProdutoForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{editingProdutoId ? "Editar Produto" : "Novo Produto"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProdutoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                          id="nome"
                          value={nomeProduto}
                          onChange={(e) => setNomeProduto(e.target.value)}
                          placeholder="Ex: Sorvete Chocolate"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="marca">Marca</Label>
                        <Input
                          id="marca"
                          value={marcaProduto}
                          onChange={(e) => setMarcaProduto(e.target.value)}
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
                          value={precoProduto}
                          onChange={(e) => setPrecoProduto(parseFloat(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unidade">Unidade *</Label>
                        <Input
                          id="unidade"
                          value={unidadeProduto}
                          onChange={(e) => setUnidadeProduto(e.target.value)}
                          placeholder="Ex: un, kg, L"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="vendr-btn-primary">
                        {editingProdutoId ? "Atualizar" : "Criar"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetProdutoForm}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Filtrar por marca..."
                value={filtroProdutoMarca}
                onChange={(e) => setFiltroProdutoMarca(e.target.value)}
                className="w-48"
              />
              <select
                value={filtroProdutoAtivo}
                onChange={(e) => setFiltroProdutoAtivo(e.target.value as any)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>

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
                          onClick={() => handleEditProduto(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={produto.ativo ? "destructive" : "default"}
                          size="icon"
                          onClick={() => handleToggleProdutoAtivo(produto.id, produto.ativo)}
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

        {/* Dialog de Edição */}
        <EditProductDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          produto={editingProduct}
          onSuccess={() => {
            loadEstoque();
            setShowEditDialog(false);
          }}
        />

        {/* Dialog de Adicionar */}
        <EditProductDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          produto={null}
          onSuccess={() => {
            loadEstoque();
            setShowAddDialog(false);
          }}
        />

        {/* Dialog de Importar CSV */}
        <ImportCSVDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onSuccess={() => {
            loadEstoque();
            setShowImportDialog(false);
          }}
        />
      </div>
    </AuthenticatedLayout>
  );
}
