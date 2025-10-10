/**
 * Dashboard Vendedor (Seller)
 * Interface simplificada: Estoque, Vendas, Comissões
 */
"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, TrendingUp, ShoppingCart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardVendedorProps {
  vendedorNome?: string;
  metrics?: {
    estoqueAtual: number;
    vendasHoje: number;
    comissoesHoje: number;
    metaDiaria: number;
  };
}

const defaultMetrics = {
  estoqueAtual: 45,
  vendasHoje: 12,
  comissoesHoje: 156.80,
  metaDiaria: 15,
};

export function DashboardVendedor({
  vendedorNome = "Vendedor",
  metrics = defaultMetrics,
}: DashboardVendedorProps) {
  const progressoMeta = (metrics.vendasHoje / metrics.metaDiaria) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-trust-blue-900 dark:text-white">
          Olá, {vendedorNome}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Acompanhe seu desempenho de vendas
        </p>
      </div>

      {/* Grid de Métricas - 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Meu Estoque Atual"
          value={`${metrics.estoqueAtual} itens`}
          icon={Package}
          accent="blue"
          trend="neutral"
        />
        
        <MetricCard
          title="Vendas Hoje"
          value={metrics.vendasHoje}
          change={20}
          changeLabel="vs ontem"
          icon={ShoppingCart}
          accent="orange"
          trend="up"
        />
        
        <MetricCard
          title="Comissões Hoje"
          value={`R$ ${metrics.comissoesHoje.toFixed(2)}`}
          change={15.5}
          changeLabel="vs ontem"
          icon={DollarSign}
          accent="success"
          trend="up"
        />
      </div>

      {/* Card Meta Diária */}
      <Card className="bg-gradient-to-r from-venlo-orange-500 to-venlo-orange-600 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-venlo-orange-100 text-sm font-medium">Meta Diária</p>
              <p className="text-3xl font-bold">
                {metrics.vendasHoje}/{metrics.metaDiaria} vendas
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-venlo-orange-100" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-bold">{Math.min(progressoMeta, 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-venlo-orange-100/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressoMeta, 100)}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-white rounded-full"
              />
            </div>
            {progressoMeta >= 100 && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center font-bold mt-2"
              >
                🎉 Meta batida! Parabéns!
              </motion.p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid Ações + Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Rápidas */}
        <Card className="bg-white dark:bg-trust-blue-800 border-gray-200 dark:border-trust-blue-700">
          <CardHeader>
            <CardTitle className="text-trust-blue-900 dark:text-white">
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/vendedor/venda">
              <Button className="w-full justify-start gap-3 bg-venlo-orange-500 hover:bg-venlo-orange-600 text-white">
                <Plus className="h-5 w-5" />
                Registrar Nova Venda
              </Button>
            </Link>
            <Link href="/vendedor/estoque">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 border-trust-blue-500 text-trust-blue-500 hover:bg-trust-blue-50 dark:hover:bg-trust-blue-700"
              >
                <Package className="h-5 w-5" />
                Ver Meu Estoque
              </Button>
            </Link>
            <Link href="/vendedor/transferencias-recebidas">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
              >
                <TrendingUp className="h-5 w-5" />
                Minhas Transferências
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card className="bg-white dark:bg-trust-blue-800 border-gray-200 dark:border-trust-blue-700">
          <CardHeader>
            <CardTitle className="text-trust-blue-900 dark:text-white">
              Meus Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { nome: "Produto A", vendas: 15 },
                { nome: "Produto B", vendas: 12 },
                { nome: "Produto C", vendas: 8 },
              ].map((produto, idx) => (
                <motion.div
                  key={produto.nome}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-trust-blue-900 rounded-venlo"
                >
                  <span className="font-medium text-trust-blue-900 dark:text-white">
                    {produto.nome}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {produto.vendas} vendas
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
