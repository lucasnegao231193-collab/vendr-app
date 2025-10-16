/**
 * Página: Meus Serviços (Modo Solo)
 * CRUD completo de serviços prestados
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, Download, Filter } from "lucide-react";
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
import type { SoloServico, CategoriaServico, StatusServico } from "@/types/servicos";

const categorias: CategoriaServico[] = ['Limpeza', 'Beleza', 'Construção', 'Transporte', 'Outros'];
const statusOptions: StatusServico[] = ['Pendente', 'Concluído', 'Pago'];

export default function SoloServicosPage() {
  const [servicos, setServicos] = useState<SoloServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_servicos: 0,
    total_recebido: 0,
    total_pendente: 0,
    total_concluido: 0,
  });

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');

  // Form
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<CategoriaServico>('Outros');
  const [descricao, setDescricao] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [status, setStatus] = useState<StatusServico>('Pendente');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');

  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadServicos();
  }, [filtroStatus, filtroCategoria]);

  const loadServicos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const params = new URLSearchParams({ user_id: user.id });
      if (filtroStatus) params.append('status', filtroStatus);
      if (filtroCategoria) params.append('categoria', filtroCategoria);

      const response = await fetch(`/api/solo/servicos?${params}`);
      const result = await response.json();

      if (response.ok) {
        setServicos(result.servicos || []);
        setStats(result.stats || {});
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
        quantidade: parseInt(quantidade),
        status,
        data,
        observacoes,
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
          description: "Operação realizada com sucesso.",
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

  const handleEdit = (servico: SoloServico) => {
    setEditingId(servico.id);
    setNome(servico.nome);
    setCategoria(servico.categoria);
    setDescricao(servico.descricao || '');
    setValorUnitario(servico.valor_unitario.toString());
    setQuantidade(servico.quantidade.toString());
    setStatus(servico.status);
    setData(servico.data);
    setObservacoes(servico.observacoes || '');
    setShowDialog(true);
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
    setQuantidade('1');
    setStatus('Pendente');
    setData(new Date().toISOString().split('T')[0]);
    setObservacoes('');
    setShowDialog(false);
  };

  const exportCSV = () => {
    const csv = [
      ['Nome', 'Categoria', 'Valor Unit.', 'Qtd', 'Total', 'Status', 'Data'].join(','),
      ...servicos.map(s => [
        s.nome,
        s.categoria,
        s.valor_unitario,
        s.quantidade,
        s.valor_unitario * s.quantidade,
        s.status,
        s.data,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servicos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: StatusServico) => {
    switch (status) {
      case 'Pago': return 'bg-green-500';
      case 'Concluído': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços prestados</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#FF6600] hover:bg-[#FF6600]/90">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total de Serviços</p>
            <p className="text-2xl font-bold">{stats.total_servicos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Recebido</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_recebido)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pendente</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.total_pendente)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Concluído</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_concluido)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={filtroStatus || "all"} onValueChange={(v) => setFiltroStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusOptions.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCategoria || "all"} onValueChange={(v) => setFiltroCategoria(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {servicos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum serviço cadastrado</p>
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
                      <Badge className={getStatusColor(servico.status)}>{servico.status}</Badge>
                      <Badge variant="outline">{servico.categoria}</Badge>
                    </div>
                    {servico.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">{servico.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-semibold text-[#FF6600]">
                        {formatCurrency(servico.valor_unitario * servico.quantidade)}
                      </span>
                      <span className="text-muted-foreground">
                        {servico.quantidade}x {formatCurrency(servico.valor_unitario)}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(servico.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
            <DialogDescription>Preencha os dados do serviço prestado</DialogDescription>
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
                  placeholder="Ex: Limpeza residencial"
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
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as StatusServico)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor">Valor Unitário (R$) *</Label>
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

              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
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

              <div className="col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações adicionais"
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
