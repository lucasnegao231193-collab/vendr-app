"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { getResumoPessoal } from '@/lib/data/pessoal';
import { ResumoPessoal } from '@/types/venlo-mode';
import { useAuth } from '@/hooks/useAuth';
import { TransacaoDialog } from './TransacaoDialog';
import { TransacoesTable } from './TransacoesTable';
import { GraficoEvolucao } from './GraficoEvolucao';
import { GraficoCategorias } from './GraficoCategorias';

export function DashboardPessoal() {
  const { user } = useAuth();
  const [resumo, setResumo] = useState<ResumoPessoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;

  useEffect(() => {
    if (user) {
      loadResumo();
    }
  }, [user]);

  async function loadResumo() {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await getResumoPessoal(user.id, ano, mes);
      setResumo(data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finanças Pessoais</h1>
          <p className="text-muted-foreground">
            {hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(resumo?.entradas || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(resumo?.saidas || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(resumo?.saldo || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(resumo?.saldo || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(resumo?.meta || 0)}
            </div>
            {resumo && resumo.meta > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {resumo.percentualMeta.toFixed(0)}% atingido
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <GraficoEvolucao userId={user?.id || ''} />
        <GraficoCategorias userId={user?.id || ''} ano={ano} mes={mes} />
      </div>

      {/* Tabela de transações */}
      <TransacoesTable 
        transacoes={resumo?.transacoes || []} 
        onUpdate={loadResumo}
      />

      {/* Dialog de nova transação */}
      <TransacaoDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadResumo}
      />
    </div>
  );
}
