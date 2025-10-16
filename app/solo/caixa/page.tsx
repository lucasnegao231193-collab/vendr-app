/**
 * Página: Caixa (Modo Solo)
 * Controle de caixa diário
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
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Plus, TrendingUp, TrendingDown, Lock, Unlock } from "lucide-react";
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

export default function SoloCaixaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [caixaAtual, setCaixaAtual] = useState<Caixa | null>(null);
  const [resumo, setResumo] = useState<any>(null);
  const [showAbrirDialog, setShowAbrirDialog] = useState(false);
  const [showFecharDialog, setShowFecharDialog] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [saldoFechamento, setSaldoFechamento] = useState('');

  useEffect(() => {
    loadCaixaAtual();
  }, []);

  const loadCaixaAtual = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/caixa?user_id=${user.id}&escopo=solo&status=Aberto`);
      const data = await response.json();

      if (data.caixas && data.caixas.length > 0) {
        const caixa = data.caixas[0];
        setCaixaAtual(caixa);
        await loadResumo(caixa.id);
      } else {
        setCaixaAtual(null);
        setResumo(null);
      }
    } catch (error) {
      console.error('Erro ao carregar caixa:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResumo = async (caixaId: string) => {
    try {
      const response = await fetch(`/api/caixa/${caixaId}`);
      const data = await response.json();
      setResumo(data.resumo);
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
          <h1 className="text-3xl font-bold">Caixa</h1>
          <p className="text-muted-foreground">Controle de caixa diário</p>
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

      {/* Status do Caixa */}
      {!caixaAtual ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Lock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Caixa Fechado</h3>
            <p className="text-gray-600 mb-4">
              Abra o caixa para começar a registrar movimentações
            </p>
            <Button onClick={() => setShowAbrirDialog(true)} className="bg-green-600 hover:bg-green-700">
              Abrir Caixa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                    <p className="text-2xl font-bold">{formatCurrency(caixaAtual.saldo_inicial)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Entradas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {resumo ? formatCurrency(resumo.total_entradas) : '-'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saídas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {resumo ? formatCurrency(resumo.total_saidas) : '-'}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Teórico</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {resumo ? formatCurrency(resumo.saldo_teorico) : '-'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Caixa */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-green-500">Aberto</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Abertura</p>
                  <p className="font-semibold">
                    {new Date(caixaAtual.data_abertura).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Método */}
          {resumo && resumo.por_metodo && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(resumo.por_metodo).map(([metodo, valores]: [string, any]) => (
                    <div key={metodo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold">{metodo}</span>
                      <div className="flex gap-4">
                        <span className="text-green-600">
                          ↑ {formatCurrency(valores.entradas)}
                        </span>
                        <span className="text-red-600">
                          ↓ {formatCurrency(valores.saidas)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

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
            {resumo && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Saldo Teórico</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(resumo.saldo_teorico)}
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

            {saldoFechamento && resumo && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Diferença</p>
                <p className={`text-xl font-bold ${
                  parseFloat(saldoFechamento) - resumo.saldo_teorico >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatCurrency(parseFloat(saldoFechamento) - resumo.saldo_teorico)}
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
