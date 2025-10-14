/**
 * Home do Vendedor: resumo do dia, kit, comissão
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { VendedorLayout } from "@/components/VendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useOfflineQueue } from "@/store/offlineQueue";
import { KitAceiteCard } from "@/components/KitAceiteCard";
import {
  ShoppingCart,
  Calculator,
  CheckCircle,
  Package,
  DollarSign,
  TrendingUp,
  WifiOff,
  Wifi,
  Target,
  PackageSearch,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

export default function VendedorHomePage() {
  const [vendedorId, setVendedorId] = useState<string>("");
  const [kit, setKit] = useState<any>(null);
  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { queue, isOnline, sync } = useOfflineQueue();
  const supabase = createClient();
  const hoje = new Date().toISOString().split("T")[0];

  const [kitPendente, setKitPendente] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadKitPendente();
  }, []);

  const loadKitPendente = async () => {
    try {
      const response = await fetch("/api/kits/aceite");
      const data = await response.json();
      
      if (data.kits && data.kits.length > 0) {
        setKitPendente(data.kits[0]); // Primeiro kit pendente
      }
    } catch (error) {
      console.error("Erro ao buscar kit pendente:", error);
    }
  };

  const loadData = async () => {
    try {
      // Buscar vendedor do usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) return;

      // Por simplicidade, assumir que o vendedor está linkado ao user_id
      // Em produção, criar tabela de vínculo user->vendedor
      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) return;

      // Buscar primeiro vendedor da empresa (MVP)
      const { data: vendedorData } = await supabase
        .from("vendedores")
        .select("*")
        .eq("empresa_id", perfil.empresa_id)
        .limit(1)
        .single();

      if (!vendedorData) return;

      setVendedorId(vendedorData.id);

      // Buscar kit do dia
      const { data: kitData } = await supabase
        .from("kits")
        .select(
          `
          *,
          kit_itens (
            *,
            produtos (*)
          )
        `
        )
        .eq("vendedor_id", vendedorData.id)
        .eq("data", hoje)
        .single();

      setKit(kitData);

      // Buscar vendas do dia
      const { data: vendasData } = await supabase
        .from("vendas")
        .select("*")
        .eq("vendedor_id", vendedorData.id)
        .gte("data_hora", `${hoje}T00:00:00`)
        .lte("data_hora", `${hoje}T23:59:59`);

      setVendas(vendasData || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Calcular KPIs
  const totalVendido = vendas.reduce((acc, v) => acc + (v.qtd * v.valor_unit), 0);
  const comissaoEstimada = totalVendido * (kit?.vendedores?.comissao_padrao || 0.10);

  return (
    <VendedorLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Olá, Vendedor!</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge className="bg-green-100 text-green-800">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            {queue.length > 0 && (
              <Badge variant="outline">{queue.length} pendentes</Badge>
            )}
          </div>
        </div>

        {/* Kit Pendente */}
        {kitPendente && (
          <KitAceiteCard 
            kit={kitPendente} 
            onAceite={() => {
              loadKitPendente();
              loadData();
            }} 
          />
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-[var(--brand-primary)]" />
                <p className="text-xs text-[var(--text-secondary)]">Vendido Hoje</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(totalVendido)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-xs text-[var(--text-secondary)]">Comissão</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatCurrency(comissaoEstimada)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-[var(--brand-accent)]" />
                <p className="text-xs text-[var(--text-secondary)]">Vendas Hoje</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{vendas.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-xs text-[var(--text-secondary)]">Itens no Kit</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {kit?.kit_itens?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu de Navegação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/vendedor/dashboard">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <LayoutDashboard className="h-6 w-6" />
                  <span className="text-sm">Dashboard</span>
                </Button>
              </Link>
              
              <Link href="/vendedor/estoque">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Meu Estoque</span>
                </Button>
              </Link>
              
              <Link href="/vendedor/transferencias-recebidas">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <PackageSearch className="h-6 w-6" />
                  <span className="text-sm">Transferências</span>
                </Button>
              </Link>
              
              <Link href="/vendedor/metas">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Target className="h-6 w-6" />
                  <span className="text-sm">Minhas Metas</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Kit do dia */}
        {kit && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Kit do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kit.kit_itens.map((item: any) => {
                const vendido = vendas
                  .filter((v) => v.produto_id === item.produto_id)
                  .reduce((acc, v) => acc + v.qtd, 0);
                const restante = item.qtd_atribuida - vendido;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{item.produtos.nome}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Atribuído: {item.qtd_atribuida}
                      </span>
                      <Badge variant={restante > 0 ? "default" : "secondary"}>
                        Restante: {restante}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/vendedor/venda">
            <Button className="w-full h-24 vendr-btn-primary flex-col gap-2">
              <ShoppingCart className="h-8 w-8" />
              <span className="text-lg">Nova Venda</span>
            </Button>
          </Link>

          <Link href="/vendedor/troco">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <Calculator className="h-8 w-8" />
              <span className="text-lg">Calculadora</span>
            </Button>
          </Link>
        </div>

        <Link href="/vendedor/fechar">
          <Button variant="secondary" className="w-full h-16 vendr-btn-secondary">
            <CheckCircle className="h-6 w-6 mr-2" />
            <span className="text-lg">Fechar Meu Dia</span>
          </Button>
        </Link>
      </div>
    </VendedorLayout>
  );
}
