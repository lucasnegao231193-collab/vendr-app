/**
 * Dashboard Solo (Autônomo)
 * Painel principal do modo Solo
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, ShoppingCart, TrendingUp, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SoloPlanBadge } from "@/components/SoloPlanBadge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import { PlanoType } from "@/types/solo";
import { OnboardingTour } from "@/components/OnboardingTour";
import { DashboardPessoal } from "@/components/painel/DashboardPessoal";
import { useVenloMode } from "@/hooks/useVenloMode";

export default function SoloDashboardPage() {
  const router = useRouter();
  const { mode, isLoading: modeLoading } = useVenloMode();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vendasHoje: 0,
    lucroEstimado: 0,
    produtosAtivos: 0,
    estoqueTotal: 0,
    vendasMes: 0,
    limiteVendas: 30,
    plano: 'solo_free' as PlanoType,
  });

  // Log para debug
  useEffect(() => {
    console.log('🔄 Modo atual na página:', mode);
    console.log('🔄 Mode loading:', modeLoading);
  }, [mode, modeLoading]);
  
  console.log('🎯 RENDER - Modo:', mode, 'Loading:', modeLoading);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/solo/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || modeLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  const kpis = [
    {
      title: "Vendas Hoje",
      value: stats.vendasHoje,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Faturamento Hoje",
      value: formatCurrency(stats.lucroEstimado),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Produtos Ativos",
      value: stats.produtosAtivos,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Estoque Total",
      value: `${stats.estoqueTotal} un`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="p-6 space-y-6" key={mode}>
      <OnboardingTour role="solo" />
      <Breadcrumbs />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#121212]">
            {mode === 'PROFISSIONAL' ? 'Dashboard Solo' : 'Finanças Pessoais'}
          </h1>
          <p className="text-gray-600">
            {mode === 'PROFISSIONAL' 
              ? 'Bem-vindo ao seu painel autônomo' 
              : 'Controle suas finanças pessoais'}
          </p>
        </motion.div>

        {/* Renderizar baseado no modo */}
        {mode === 'PROFISSIONAL' ? (
          <>
            {/* Badge de Plano */}
            <SoloPlanBadge
              plano={stats.plano}
              vendasMes={stats.vendasMes}
              limite={stats.limiteVendas}
            />

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="vendr-card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push('/solo/venda-nova')}
                  className="w-full bg-[#0057FF] hover:bg-[#0046CC] text-white"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Nova Venda
                </Button>
                <Button
                  onClick={() => router.push('/solo/estoque')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Gerenciar Estoque
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="vendr-card-gradient hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </CardTitle>
                  <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#121212]">
                    {kpi.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Navegação para outras páginas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/solo/vendas')}
                  className="w-full justify-start"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ver Vendas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/solo/estoque')}
                  className="w-full justify-start"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Estoque
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/solo/financeiro')}
                  className="w-full justify-start"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financeiro
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dica para iniciantes */}
        {stats.produtosAtivos === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  👋 Primeiros Passos
                </h3>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li>1️⃣ Adicione seus produtos no estoque</li>
                  <li>2️⃣ Registre sua primeira venda</li>
                  <li>3️⃣ Acompanhe seu faturamento</li>
                </ol>
                <Button
                  onClick={() => router.push('/solo/estoque')}
                  className="mt-3 w-full"
                  size="sm"
                >
                  Começar Agora
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
          </>
        ) : (
          <DashboardPessoal />
        )}
    </div>
  );
}
