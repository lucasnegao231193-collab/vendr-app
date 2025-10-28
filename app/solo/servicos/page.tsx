/**
 * Página: Catálogo de Serviços (Modo Solo)
 * Gerenciar tipos de serviços oferecidos (ex: Manicure, Corte de Cabelo)
 */
"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServicoCatalogo, CategoriaServico } from "@/types/servicos";

const categorias: CategoriaServico[] = ['Limpeza', 'Beleza', 'Construção', 'Transporte', 'Outros'];

export default function SoloServicosPage() {
  const [servicos, setServicos] = useState<ServicoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<CategoriaServico>('Outros');
  const [descricao, setDescricao] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');

  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadServicos();
  }, []);

  const loadServicos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/solo/servicos?user_id=${user.id}`);
      const result = await response.json();

      if (response.ok) {
        setServicos(result.servicos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const servicoData = {
        user_id: user.id,
        nome,
        categoria,
        descricao,
        valor_unitario: parseFloat(valorUnitario),
      };

      let response;
      if (editingId) {
        response = await fetch(`/api/solo/servicos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servicoData),
        });
      } else {
        response = await fetch('/api/solo/servicos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servicoData),
        });
      }

      if (response.ok) {
        toast({
          title: editingId ? "Serviço atualizado!" : "Serviço adicionado!",
          description: "Agora você pode vender este serviço.",
        });
        resetForm();
        loadServicos();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (servico: ServicoCatalogo) => {
    setEditingId(servico.id);
    setNome(servico.nome);
    setCategoria(servico.categoria);
    setDescricao(servico.descricao || '');
    setValorUnitario(servico.valor_unitario.toString());
    setShowDialog(true);
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/solo/servicos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      });

      if (response.ok) {
        toast({ title: ativo ? "Serviço desativado" : "Serviço ativado" });
        loadServicos();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return;

    try {
      const response = await fetch(`/api/solo/servicos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: "Serviço excluído!" });
        loadServicos();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setCategoria('Outros');
    setDescricao('');
    setValorUnitario('');
    setShowDialog(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catálogo de Serviços</h1>
          <p className="text-muted-foreground">Gerencie os tipos de serviços que você oferece</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#FF6600] hover:bg-[#FF6600]/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {servicos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum serviço cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Cadastre os tipos de serviços que você oferece (ex: Manicure, Corte de Cabelo)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {servicos.map((servico, index) => (
                <motion.div
                  key={servico.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{servico.nome}</h3>
                      <Badge variant="outline">{servico.categoria}</Badge>
                      {!servico.ativo && (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </div>
                    {servico.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">{servico.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-semibold text-[#FF6600]">
                        {formatCurrency(servico.valor_unitario)} / unidade
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleToggleAtivo(servico.id, servico.ativo)}
                      title={servico.ativo ? "Desativar" : "Ativar"}
                    >
                      {servico.ativo ? (
                        <Power className="h-4 w-4 text-green-600" />
                      ) : (
                        <PowerOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(servico)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(servico.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            <DialogDescription>Cadastre um tipo de serviço que você oferece</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome do Serviço *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: Manicure, Corte de Cabelo"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaServico)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor">Valor Padrão (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Detalhes do serviço"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#FF6600] hover:bg-[#FF6600]/90">
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
