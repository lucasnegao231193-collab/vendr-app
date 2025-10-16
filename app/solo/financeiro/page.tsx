/**
 * Financeiro - Modo Solo
 * Resumo financeiro e fechamento de caixa
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExportButtons } from "@/components/ExportButtons";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, CreditCard, Smartphone, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { TableSkeleton } from "@/components/LoadingSkeleton";

interface ResumoFinanceiro {
  total: number;
  pix: number;
  cartao: number;
  dinheiro: number;
  vendas: number;
}

export default function SoloFinanceiroPage() {
  const router = useRouter();
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

  useEffect(() => {
    loadResumo();
  }, [periodo]);

  const loadResumo = async () => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const handleFecharCaixa = () => {
    toast({
      title: "📋 Relatório gerado!",
      description: "Funcionalidade de fechamento em desenvolvimento",
    });
  };

  const periodos = [
    { id: 'hoje', label: 'Hoje', icon: Calendar },
    { id: 'semana', label: 'Últimos 7 dias', icon: Calendar },
    { id: 'mes', label: 'Último mês', icon: Calendar },
  ];

  const metodosPagamento = [
    {
      id: 'pix',
      label: 'PIX',
      valor: resumo.pix,
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'cartao',
      label: 'Cartão',
      valor: resumo.cartao,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'dinheiro',
      label: 'Dinheiro',
      valor: resumo.dinheiro,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

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
            <h1 className="text-3xl font-bold text-[#121212]">Financeiro</h1>
            <p className="text-gray-600">Resumo das suas vendas</p>
          </div>
          <Button
            onClick={handleFecharCaixa}
            className="bg-[#0057FF] hover:bg-[#0046CC] text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Fechar Caixa
          </Button>
        </motion.div>

        {/* Seletor de Período */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              {periodos.map((p) => (
                <Button
                  key={p.id}
                  variant={periodo === p.id ? "default" : "outline"}
                  onClick={() => setPeriodo(p.id as any)}
                  className="flex-1"
                >
                  <p.icon className="h-4 w-4 mr-2" />
                  {p.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Total Geral */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-br from-[#0057FF] to-[#FF6B00] text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Faturamento Total</p>
                  <p className="text-5xl font-bold">
                    {formatCurrency(resumo.total)}
                  </p>
                  <p className="text-white/80 mt-2">
                    {resumo.vendas} venda(s) realizada(s)
                  </p>
                </div>
                <TrendingUp className="h-20 w-20 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Por Método de Pagamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metodosPagamento.map((metodo, index) => (
            <motion.div
              key={metodo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${metodo.bgColor} p-3 rounded-lg`}>
                      <metodo.icon className={`h-6 w-6 ${metodo.color}`} />
                    </div>
                    <Badge>{metodo.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total em {metodo.label}</p>
                  <p className={`text-2xl font-bold ${metodo.color}`}>
                    {formatCurrency(metodo.valor)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {resumo.total > 0
                      ? `${((metodo.valor / resumo.total) * 100).toFixed(1)}% do total`
                      : '0% do total'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Gráfico de Pizza (Placeholder) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Distribuição por Método</CardTitle>
            <ExportButtons
              data={[
                { metodo: 'PIX', valor: resumo.pix },
                { metodo: 'Cartão', valor: resumo.cartao },
                { metodo: 'Dinheiro', valor: resumo.dinheiro },
                { metodo: 'TOTAL', valor: resumo.total },
              ]}
              filename={`financeiro-solo-${periodo}`}
              title={`Financeiro Solo - ${periodo}`}
              columns={[
                { header: 'Método', key: 'metodo' },
                { header: 'Valor (R$)', key: 'valor' },
              ]}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metodosPagamento.map((metodo) => {
                const percentual = resumo.total > 0
                  ? (metodo.valor / resumo.total) * 100
                  : 0;
                
                return (
                  <div key={metodo.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{metodo.label}</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(metodo.valor)} ({percentual.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metodo.id === 'pix' ? 'bg-green-500' :
                          metodo.id === 'cartao' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dicas */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              💡 Dica Financeira
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Mantenha um controle regular do seu caixa. Faça fechamentos diários para
              acompanhar melhor o desempenho do seu negócio.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
