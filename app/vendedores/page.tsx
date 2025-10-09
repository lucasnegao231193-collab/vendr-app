/**
 * Página de CRUD de vendedores + atribuir kit
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { CreateSellerDialog } from "@/components/CreateSellerDialog";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Users, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { KitForm } from "@/components/KitForm";

interface Vendedor {
  id: string;
  nome: string;
  telefone: string | null;
  doc: string | null;
  comissao_padrao: number;
  ativo: boolean;
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [doc, setDoc] = useState("");
  const [comissaoPadrao, setComissaoPadrao] = useState(10);

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vendedoresRes, produtosRes] = await Promise.all([
        supabase.from("vendedores").select("*").order("nome"),
        supabase.from("produtos").select("*").eq("ativo", true),
      ]);

      setVendedores(vendedoresRes.data || []);
      setProdutos(produtosRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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
        const { error } = await supabase
          .from("vendedores")
          .update({
            nome,
            telefone,
            doc,
            comissao_padrao: comissaoPadrao / 100,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Vendedor atualizado!" });
      } else {
        const { error } = await supabase.from("vendedores").insert({
          nome,
          telefone,
          doc,
          comissao_padrao: comissaoPadrao / 100,
          empresa_id: perfil.empresa_id,
        });

        if (error) throw error;
        toast({ title: "Vendedor criado!" });
      }

      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Erro ao criar/atualizar vendedor:", error);
      toast({
        title: "Erro ao criar vendedor",
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (vendedor: Vendedor) => {
    setEditingId(vendedor.id);
    setNome(vendedor.nome);
    setTelefone(vendedor.telefone || "");
    setDoc(vendedor.doc || "");
    setComissaoPadrao(vendedor.comissao_padrao * 100);
    setShowForm(true);
  };

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setDoc("");
    setComissaoPadrao(10);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!editingId) return;

    const confirmDelete = confirm(
      `Tem certeza que deseja excluir o vendedor "${nome}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("vendedores")
        .delete()
        .eq("id", editingId);

      if (error) throw error;

      toast({
        title: "Vendedor excluído!",
        description: "O vendedor foi removido com sucesso.",
      });

      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Vendedores</h1>
            <p className="text-[var(--text-secondary)]">Gerencie sua equipe de vendas</p>
          </div>
          <CreateSellerDialog onSuccess={loadData} />
        </div>

        <Tabs defaultValue="lista">
          <TabsList>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="kit">Atribuir Kit</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            {showForm && (
              <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
                <CardHeader>
                  <CardTitle>{editingId ? "Editar Vendedor" : "Novo Vendedor"}</CardTitle>
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
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="doc">CPF/RG</Label>
                        <Input
                          id="doc"
                          value={doc}
                          onChange={(e) => setDoc(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comissao">Comissão (%) *</Label>
                        <Input
                          id="comissao"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={comissaoPadrao}
                          onChange={(e) => setComissaoPadrao(parseFloat(e.target.value))}
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
                      {editingId && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Excluir vendedor
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
              <CardContent className="pt-6">
                {loading ? (
                  <SkeletonTable rows={5} columns={5} />
                ) : vendedores.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-12 w-12" />}
                    title="Nenhum vendedor cadastrado"
                    description="Clique em 'Criar Vendedor' para adicionar seu primeiro vendedor."
                    action={{
                      label: "Criar Vendedor",
                      onClick: () => setShowForm(true),
                    }}
                  />
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendedores.map((vendedor) => (
                      <TableRow key={vendedor.id}>
                        <TableCell className="font-medium">{vendedor.nome}</TableCell>
                        <TableCell>{vendedor.telefone || "-"}</TableCell>
                        <TableCell>{(vendedor.comissao_padrao * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant={vendedor.ativo ? "default" : "outline"}>
                            {vendedor.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(vendedor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kit">
            <KitForm
              vendedores={vendedores.filter((v) => v.ativo)}
              produtos={produtos}
              onSuccess={() => toast({ title: "Kit criado com sucesso!" })}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
