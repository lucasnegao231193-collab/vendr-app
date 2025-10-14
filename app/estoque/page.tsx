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

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadEstoque();
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
            Adicionar Produto
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
