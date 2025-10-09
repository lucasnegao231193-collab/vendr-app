/**
 * Dashboard do Owner
 * KPIs, insights e navegação rápida
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CreditCard, ShoppingCart, Users, Package, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ModernTopBar } from "@/components/ModernTopBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { QuickActions } from "@/components/QuickActions";
import { AlertsCard, generateAlerts } from "@/components/AlertsCard";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  
  const supabase = createClient();
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vendasRes, vendedoresRes, produtosRes] = await Promise.all([
        supabase
          .from("vendas")
          .select("*")
          .gte("data_hora", `${hoje}T00:00:00`)
          .lte("data_hora", `${hoje}T23:59:59`)
          .eq("status", "confirmado"),
        supabase.from("vendedores").select("*").eq("ativo", true),
        supabase.from("produtos").select("*").eq("ativo", true),
      ]);

      setVendas(vendasRes.data || []);
      setVendedores(vendedoresRes.data || []);
      setProdutos(produtosRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular KPIs
  const totalVendido = vendas.reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);
  const totalPix = vendas
    .filter((v) => v.meio_pagamento === "pix")
    .reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);
  const ticketMedio = vendas.length > 0 ? totalVendido / vendas.length : 0;
  const percentualPix = totalVendido > 0 ? (totalPix / totalVendido) * 100 : 0;

  const alerts = generateAlerts(produtos, vendedores);

  if (loading) {
    return (
      <AuthenticatedLayout requiredRole="owner">
        <ModernTopBar userName="Admin" />
        <div className="pt-20 px-4 md:px-6">
          <DashboardSkeleton />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout requiredRole="owner">
      <ModernTopBar userName="Admin" />
      <div className="pt-20 px-4 md:px-6 space-y-6 animate-fade-in">
        <Breadcrumbs />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-[var(--text-secondary)]">
              Hoje: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Alerts */}
        {alerts.length > 0 && <AlertsCard alerts={alerts} />}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="vendr-card-gradient hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                  Total Vendido Hoje
                </CardTitle>
                <DollarSign className="h-4 w-4 text-[var(--brand-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatCurrency(totalVendido)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="vendr-card-gradient hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                  Ticket Médio
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-[var(--success)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatCurrency(ticketMedio)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="vendr-card-gradient hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                  PIX (%)
                </CardTitle>
                <CreditCard className="h-4 w-4 text-[var(--brand-accent)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {percentualPix.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="vendr-card-gradient hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                  Vendas Hoje
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-[var(--warning)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {vendas.length}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navegação Rápida */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="vendedores" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vendedores" onClick={() => router.push('/vendedores')}>
                  <Users className="h-4 w-4 mr-2" />
                  Vendedores
                </TabsTrigger>
                <TabsTrigger value="estoque" onClick={() => router.push('/estoque')}>
                  <Package className="h-4 w-4 mr-2" />
                  Estoque
                </TabsTrigger>
                <TabsTrigger value="financeiro" onClick={() => router.push('/financeiro')}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financeiro
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Insights Simples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Vendedores Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--brand-primary)]">
                {vendedores.length}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Total cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Produtos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--success)]">
                {produtos.length}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Disponíveis para venda
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[var(--warning)]" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)]">
                {vendas.length > 0 ? '✅ Sistema operando normalmente' : '⚠️ Nenhuma venda hoje'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State se não houver vendas */}
        {!loading && vendas.length === 0 && (
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="pt-6">
              <EmptyState
                icon={<ShoppingCart className="h-12 w-12" />}
                title="Nenhuma venda registrada hoje"
                description="As vendas do dia aparecerão aqui assim que os vendedores começarem a registrar."
                action={{
                  label: "Gerenciar Vendedores",
                  onClick: () => router.push('/vendedores'),
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
