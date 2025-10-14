/**
 * Dashboard do Owner - MODERNIZADO
 * Usando DashboardEmpresa com Trust Blue Design
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { EmpresaLayout } from "@/components/EmpresaLayout";
import { DashboardEmpresa } from "@/components/dashboards/DashboardEmpresa";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  
  const supabase = createClient();
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Buscar empresa_id do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) return;

      const empresaId = perfil.empresa_id;

      const [vendasRes, vendedoresRes] = await Promise.all([
        supabase
          .from("vendas")
          .select("*")
          .eq("empresa_id", empresaId)
          .gte("data_hora", `${hoje}T00:00:00`)
          .lte("data_hora", `${hoje}T23:59:59`)
          .eq("status", "confirmado"),
        supabase
          .from("vendedores")
          .select("id, nome")
          .eq("empresa_id", empresaId)
          .eq("ativo", true),
      ]);

      setVendas(vendasRes.data || []);
      setVendedores(vendedoresRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <EmpresaLayout>
        <DashboardSkeleton />
      </EmpresaLayout>
    );
  }

  // Calcular métricas do dia
  const totalVendido = vendas.reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);
  const totalPix = vendas
    .filter((v) => v.meio_pagamento === "pix")
    .reduce((acc, v) => acc + v.qtd * v.valor_unit, 0);
  const ticketMedio = vendas.length > 0 ? totalVendido / vendas.length : 0;
  const percentualPix = totalVendido > 0 ? (totalPix / totalVendido) * 100 : 0;

  // Calcular top vendedores (simulado - pode buscar do banco)
  const topVendedores = vendedores.slice(0, 3).map((v, idx) => ({
    id: v.id,
    nome: v.nome,
    vendas: Math.floor(Math.random() * 50) + 10,
    meta: 50,
  }));

  const metrics = {
    totalVendidoHoje: totalVendido,
    ticketMedio,
    percentualPix,
    totalVendasDia: vendas.length,
  };

  return (
    <EmpresaLayout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <DashboardEmpresa metrics={metrics} topVendedores={topVendedores} />
      )}
    </EmpresaLayout>
  );
}
