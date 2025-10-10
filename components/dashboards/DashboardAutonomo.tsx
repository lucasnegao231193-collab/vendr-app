/**
 * Dashboard Autônomo (Solo/Independente)
 * Layout mobile-first simplificado
 */
"use client";

import { useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardAutonomoProps {
  saldoDia?: number;
  estoque?: Array<{
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
  }>;
}

const defaultEstoque = [
  { id: "1", nome: "Produto A", quantidade: 12, preco: 45.00 },
  { id: "2", nome: "Produto B", quantidade: 8, preco: 32.50 },
  { id: "3", nome: "Produto C", quantidade: 15, preco: 28.90 },
];

export function DashboardAutonomo({
  saldoDia = 456.80,
  estoque = defaultEstoque,
}: DashboardAutonomoProps) {
  const [activeTab, setActiveTab] = useState("resumo");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-trust-blue-900">
      {/* Header Fixo com Saldo */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-venlo-orange-500 to-venlo-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-md mx-auto">
          <p className="text-venlo-orange-100 text-sm font-medium">Saldo de Hoje</p>
          <p className="text-4xl font-bold mt-1">
            R$ {saldoDia.toFixed(2)}
          </p>
          <p className="text-venlo-orange-100 text-xs mt-2">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Vendas Hoje"
            value="12"
            icon={ShoppingCart}
            accent="blue"
            className="text-center"
          />
          <MetricCard
            title="Itens Estoque"
            value={estoque.reduce((acc, item) => acc + item.quantidade, 0)}
            icon={Package}
            accent="success"
            className="text-center"
          />
        </div>

        {/* Tabs: Resumo, Estoque, Relatórios */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Tab Resumo */}
          <TabsContent value="resumo" className="space-y-4">
            <Card className="bg-white dark:bg-trust-blue-800">
              <CardHeader>
                <CardTitle className="text-trust-blue-900 dark:text-white text-lg">
                  Resumo do Dia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-trust-blue-900 rounded-venlo">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Total Vendido
                  </span>
                  <span className="font-bold text-trust-blue-900 dark:text-white">
                    R$ 456,80
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-trust-blue-900 rounded-venlo">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Ticket Médio
                  </span>
                  <span className="font-bold text-trust-blue-900 dark:text-white">
                    R$ 38,07
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-trust-blue-900 rounded-venlo">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Método + Usado
                  </span>
                  <span className="font-bold text-trust-blue-900 dark:text-white">
                    PIX (67%)
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Estoque */}
          <TabsContent value="estoque" className="space-y-3">
            {estoque.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white dark:bg-trust-blue-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-trust-blue-900 dark:text-white">
                          {item.nome}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-venlo-orange-500">
                          {item.quantidade}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          em estoque
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Tab Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <Card className="bg-white dark:bg-trust-blue-800">
              <CardHeader>
                <CardTitle className="text-trust-blue-900 dark:text-white text-lg">
                  Vendas da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-trust-blue-900 rounded-venlo">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Gráfico de barras aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Botão Flutuante Nova Venda */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="fixed bottom-6 right-6"
      >
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-venlo-orange-500 hover:bg-venlo-orange-600 shadow-2xl"
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </motion.div>
    </div>
  );
}
