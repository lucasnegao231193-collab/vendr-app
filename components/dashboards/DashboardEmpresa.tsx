/**
 * Dashboard Empresa (Owner/Admin)
 * Grid 4 métricas + gráficos + ações rápidas
 */
"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  ShoppingCart,
  Users,
  Package,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardEmpresaProps {
  metrics?: {
    totalVendidoHoje: number;
    ticketMedio: number;
    percentualPix: number;
    totalVendasDia: number;
  };
  topVendedores?: Array<{
    id: string;
    nome: string;
    vendas: number;
    meta: number;
  }>;
}

const defaultMetrics = {
  totalVendidoHoje: 12450.00,
  ticketMedio: 156.80,
  percentualPix: 68.5,
  totalVendasDia: 79,
};

const defaultTopVendedores = [
  { id: "1", nome: "João Silva", vendas: 45, meta: 50 },
  { id: "2", nome: "Maria Santos", vendas: 38, meta: 40 },
  { id: "3", nome: "Pedro Costa", vendas: 32, meta: 35 },
];

export function DashboardEmpresa({
  metrics = defaultMetrics,
  topVendedores = defaultTopVendedores,
}: DashboardEmpresaProps) {
  const acoes = [
    {
      label: "Transferências",
      href: "/transferencias",
      icon: ArrowLeftRight,
      color: "bg-venlo-orange-500 hover:bg-venlo-orange-600",
    },
    {
      label: "Gerenciar Estoque",
      href: "/estoque",
      icon: Package,
      color: "bg-trust-blue-500 hover:bg-trust-blue-600",
    },
    {
      label: "Ver Vendedores",
      href: "/vendedores",
      icon: Users,
      color: "bg-info hover:bg-info/90",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-trust-blue-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Visão geral das suas operações
        </p>
      </div>

      {/* Grid de Métricas - 4 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Vendido Hoje"
          value={`R$ ${metrics.totalVendidoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={12.5}
          changeLabel="vs ontem"
          icon={DollarSign}
          accent="orange"
          trend="up"
        />
        
        <MetricCard
          title="Ticket Médio"
          value={`R$ ${metrics.ticketMedio.toFixed(2)}`}
          change={-3.2}
          changeLabel="vs semana"
          icon={TrendingUp}
          accent="blue"
          trend="down"
        />
        
        <MetricCard
          title="Percentual PIX"
          value={`${metrics.percentualPix.toFixed(1)}%`}
          change={8.4}
          changeLabel="vs mês"
          icon={CreditCard}
          accent="success"
          trend="up"
        />
        
        <MetricCard
          title="Total Vendas Dia"
          value={metrics.totalVendasDia}
          change={5.1}
          changeLabel="vs ontem"
          icon={ShoppingCart}
          accent="warning"
          trend="up"
        />
      </div>

      {/* Grid Gráficos + Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Faturamento (placeholder) */}
        <Card className="lg:col-span-2 bg-white dark:bg-trust-blue-800 border-gray-200 dark:border-trust-blue-700">
          <CardHeader>
            <CardTitle className="text-trust-blue-900 dark:text-white">
              Faturamento Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-trust-blue-900 rounded-venlo">
              <p className="text-gray-500 dark:text-gray-400">
                Gráfico de linha aqui (Recharts/Chart.js)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="bg-white dark:bg-trust-blue-800 border-gray-200 dark:border-trust-blue-700">
          <CardHeader>
            <CardTitle className="text-trust-blue-900 dark:text-white">
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {acoes.map((acao, idx) => {
              const Icon = acao.icon;
              return (
                <motion.div
                  key={acao.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={acao.href}>
                    <Button 
                      className={`w-full justify-start gap-3 ${acao.color} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                      {acao.label}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top Vendedores */}
      <Card className="bg-white dark:bg-trust-blue-800 border-gray-200 dark:border-trust-blue-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-trust-blue-900 dark:text-white">
            Top Vendedores do Mês
          </CardTitle>
          <Link href="/vendedores">
            <Button variant="ghost" size="sm" className="gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topVendedores.map((vendedor, idx) => {
              const progresso = (vendedor.vendas / vendedor.meta) * 100;
              const cores = ["text-gold", "text-silver", "text-bronze"];
              
              return (
                <motion.div
                  key={vendedor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`text-2xl font-bold ${cores[idx] || "text-gray-400"}`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-trust-blue-900 dark:text-white">
                        {vendedor.nome}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {vendedor.vendas}/{vendedor.meta} vendas
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-trust-blue-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progresso}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full ${
                          progresso >= 100 
                            ? "bg-success" 
                            : progresso >= 75 
                            ? "bg-venlo-orange-500" 
                            : "bg-info"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
