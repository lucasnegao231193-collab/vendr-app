/**
 * Financeiro + Caixa - Modo Solo
 * Controle financeiro unificado com gestão de caixa
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
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  Smartphone, 
  Wallet,
  Lock,
  Unlock,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Caixa } from "@/types/caixa";

interface ResumoFinanceiro {
  total: number;
  pix: number;
  cartao: number;
  dinheiro: number;
  vendas: number;
}

export default function SoloFinanceiroPage() {
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    total: 0,
    pix: 0,
    cartao: 0,
    dinheiro: 0,
    vendas: 0,
  });

  // Estados do Caixa
  const [caixaAtual, setCaixaAtual] = useState<Caixa | null>(null);
  const [resumoCaixa, setResumoCaixa] = useState<any>(null);
  const [showAbrirDialog, setShowAbrirDialog] = useState(false);
  const [showFecharDialog, setShowFecharDialog] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [saldoFechamento, setSaldoFechamento] = useState('');

  useEffect(() => {
    loadDados();
  }, [periodo]);

  const loadDados = async () => {
    setLoading(true);
    await Promise.all([
      loadResumo(),
      loadCaixaAtual(),
    ]);
    setLoading(false);
  };

  const loadCaixaAtual = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/caixa?user_id=${user.id}&escopo=solo&status=Aberto`);
      const data = await response.json();

      if (data.caixas && data.caixas.length > 0) {
        const caixa = data.caixas[0];
        setCaixaAtual(caixa);
        await loadResumoCaixa(caixa.id);
      } else {
        setCaixaAtual(null);
        setResumoCaixa(null);
      }
    } catch (error) {
      console.error('Erro ao carregar caixa:', error);
    }
  };

  const loadResumoCaixa = async (caixaId: string) => {
    try {
      const response = await fetch(`/api/caixa/${caixaId}`);
      const data = await response.json();
      setResumoCaixa(data.resumo);
    } catch (error) {
      console.error('Erro ao carregar resumo do caixa:', error);
    }
  };

  const loadResumo = async () => {
    try {
      const hoje = new Date();
      let dataInicio = '';
      
      switch (periodo) {
        case 'hoje':
          dataInicio = hoje.toISOString().split('T')[0];
          break;
        case 'semana':
          const semanaAtras = new Date(hoje);
          semanaAtras.setDate(hoje.getDate() - 7);
          dataInicio = semanaAtras.toISOString().split('T')[0];
          break;
        case 'mes':
          const mesAtras = new Date(hoje);
          mesAtras.setMonth(hoje.getMonth() - 1);
          dataInicio = mesAtras.toISOString().split('T')[0];
          break;
      }

      // Buscar vendas de produtos
      const { data: vendas, error } = await supabase
        .from('vendas')
        .select('qtd, valor_unit, meio_pagamento')
        .gte('data_hora', `${dataInicio}T00:00:00`)
        .eq('status', 'confirmado');

      if (error) throw error;

      // Buscar vendas de serviços
      const { data: { user } } = await supabase.auth.getUser();
      const { data: vendasServicos } = await supabase
        .from('vendas_servicos')
        .select('valor_total, metodo_pagamento')
        .eq('user_id', user?.id)
        .gte('data_venda', `${dataInicio}T00:00:00`)
        .eq('status', 'Concluído');

      // Calcular resumo de produtos
      const totalVendasProdutos = vendas?.length || 0;
      const totalProdutos = (vendas || []).reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0);
      const pixProdutos = (vendas || [])
        .filter(v => v.meio_pagamento === 'pix')
        .reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0);
      const cartaoProdutos = (vendas || [])
        .filter(v => v.meio_pagamento === 'cartao')
        .reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0);
      const dinheiroProdutos = (vendas || [])
        .filter(v => v.meio_pagamento === 'dinheiro')
        .reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0);

      // Calcular resumo de serviços
      const totalVendasServicos = vendasServicos?.length || 0;
      const totalServicos = (vendasServicos || []).reduce((sum, v) => sum + v.valor_total, 0);
      const pixServicos = (vendasServicos || [])
        .filter(v => v.metodo_pagamento === 'PIX')
        .reduce((sum, v) => sum + v.valor_total, 0);
      const cartaoServicos = (vendasServicos || [])
        .filter(v => v.metodo_pagamento === 'Credito' || v.metodo_pagamento === 'Debito')
        .reduce((sum, v) => sum + v.valor_total, 0);
      const dinheiroServicos = (vendasServicos || [])
        .filter(v => v.metodo_pagamento === 'Dinheiro')
        .reduce((sum, v) => sum + v.valor_total, 0);

      // Somar tudo
      setResumo({
        total: totalProdutos + totalServicos,
        pix: pixProdutos + pixServicos,
        cartao: cartaoProdutos + cartaoServicos,
        dinheiro: dinheiroProdutos + dinheiroServicos,
        vendas: totalVendasProdutos + totalVendasServicos,
      });
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const handleAbrirCaixa = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('/api/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          escopo: 'solo',
          saldo_inicial: parseFloat(saldoInicial) || 0,
        }),
      });

      if (response.ok) {
        toast({ title: "✓ Caixa aberto com sucesso!" });
        setSaldoInicial('');
        setShowAbrirDialog(false);
        loadCaixaAtual();
      } else {
        const data = await response.json();
        toast({
          title: "Erro ao abrir caixa",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFecharCaixa = async () => {
    if (!caixaAtual) return;

    try {
      const response = await fetch(`/api/caixa/${caixaAtual.id}/fechar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saldo_fechamento: parseFloat(saldoFechamento),
        }),
      });

      if (response.ok) {
        toast({ title: "✓ Caixa fechado com sucesso!" });
        setSaldoFechamento('');
        setShowFecharDialog(false);
        loadCaixaAtual();
      } else {
        const data = await response.json();
        toast({
          title: "Erro ao fechar caixa",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Resumo financeiro e controle de caixa</p>
        </div>
        {!caixaAtual ? (
          <Button
            onClick={() => setShowAbrirDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Unlock className="h-4 w-4 mr-2" />
            Abrir Caixa
          </Button>
        ) : (
          <Button
            onClick={() => setShowFecharDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Lock className="h-4 w-4 mr-2" />
            Fechar Caixa
          </Button>
        )}
      </div>

      {/* Seção de Caixa */}
      {caixaAtual && resumoCaixa && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Caixa Atual
              </CardTitle>
              <Badge className="bg-green-500">Aberto</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Saldo Inicial</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(caixaAtual.saldo_inicial)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Entradas</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumoCaixa.total_entradas)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-muted-foreground">Saídas</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(resumoCaixa.total_saidas)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Saldo Teórico</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(resumoCaixa.saldo_teorico)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={periodo === 'hoje' ? 'default' : 'outline'}
              onClick={() => setPeriodo('hoje')}
            >
              Hoje
            </Button>
            <Button
              variant={periodo === 'semana' ? 'default' : 'outline'}
              onClick={() => setPeriodo('semana')}
            >
              Últimos 7 dias
            </Button>
            <Button
              variant={periodo === 'mes' ? 'default' : 'outline'}
              onClick={() => setPeriodo('mes')}
            >
              Último mês
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <p className="text-sm opacity-90 mb-2">Faturamento Total</p>
          <p className="text-4xl font-bold mb-1">{formatCurrency(resumo.total)}</p>
          <p className="text-sm opacity-75">{resumo.vendas} venda(s) realizada(s)</p>
        </CardContent>
      </Card>

      {/* Distribuição por Método */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <Badge>PIX</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Total em PIX</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.pix)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumo.total > 0 ? `${((resumo.pix / resumo.total) * 100).toFixed(0)}% do total` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <Badge>Cartão</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Total em Cartão</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(resumo.cartao)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumo.total > 0 ? `${((resumo.cartao / resumo.total) * 100).toFixed(0)}% do total` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <Badge>Dinheiro</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Total em Dinheiro</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(resumo.dinheiro)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumo.total > 0 ? `${((resumo.dinheiro / resumo.total) * 100).toFixed(0)}% do total` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Abrir Caixa */}
      <Dialog open={showAbrirDialog} onOpenChange={setShowAbrirDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogDescription>Informe o saldo inicial do caixa</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="saldo_inicial">Saldo Inicial (R$)</Label>
              <Input
                id="saldo_inicial"
                type="number"
                step="0.01"
                min="0"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbrirDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAbrirCaixa} className="bg-green-600 hover:bg-green-700">
              Abrir Caixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Fechar Caixa */}
      <Dialog open={showFecharDialog} onOpenChange={setShowFecharDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
            <DialogDescription>
              Informe o saldo contado fisicamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {resumoCaixa && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Saldo Teórico</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(resumoCaixa.saldo_teorico)}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="saldo_fechamento">Saldo Contado (R$)</Label>
              <Input
                id="saldo_fechamento"
                type="number"
                step="0.01"
                min="0"
                value={saldoFechamento}
                onChange={(e) => setSaldoFechamento(e.target.value)}
                placeholder="0,00"
              />
            </div>

            {saldoFechamento && resumoCaixa && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Diferença</p>
                <p className={`text-xl font-bold ${
                  parseFloat(saldoFechamento) - resumoCaixa.saldo_teorico >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatCurrency(parseFloat(saldoFechamento) - resumoCaixa.saldo_teorico)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFecharDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFecharCaixa} className="bg-red-600 hover:bg-red-700">
              Fechar Caixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
