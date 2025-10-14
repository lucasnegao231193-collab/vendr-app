/**
 * Página: /vendedor/metas
 * Visualiza e gerencia metas do vendedor
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlobalTopBar } from "@/components/GlobalTopBar";
import { Target, TrendingUp, Calendar, DollarSign, Award, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MetasPage() {
  const [metas, setMetas] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    metaHoje: 0,
    vendidoHoje: 0,
    metaMes: 0,
    vendidoMes: 0,
  });
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar vendedor
      const { data: vendedor } = await supabase
        .from('vendedores')
        .select('id, empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!vendedor) return;

      // Buscar metas
      const { data: metasData } = await supabase
        .from('metas')
        .select('*')
        .eq('vendedor_id', vendedor.id)
        .order('data', { ascending: false })
        .limit(30);

      setMetas(metasData || []);

      // Buscar vendas do mês
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      const { data: vendasData } = await supabase
        .from('vendas')
        .select('*, produtos(nome, preco)')
        .eq('vendedor_id', vendedor.id)
        .gte('data_hora', primeiroDiaMes.toISOString())
        .order('data_hora', { ascending: false });

      setVendas(vendasData || []);

      // Calcular stats
      const hojeDateStr = hoje.toISOString().split('T')[0];
      const metaHoje = metasData?.find(m => m.data === hojeDateStr)?.valor_meta || 0;
      
      const vendidoHoje = vendasData
        ?.filter(v => v.data_hora.startsWith(hojeDateStr))
        .reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0) || 0;

      const metaMes = metasData
        ?.filter(m => m.data.startsWith(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`))
        .reduce((sum, m) => sum + m.valor_meta, 0) || 0;

      const vendidoMes = vendasData?.reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0) || 0;

      setStats({ metaHoje, vendidoHoje, metaMes, vendidoMes });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progressoHoje = stats.metaHoje > 0 ? (stats.vendidoHoje / stats.metaHoje) * 100 : 0;
  const progressoMes = stats.metaMes > 0 ? (stats.vendidoMes / stats.metaMes) * 100 : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 80) return "bg-yellow-500";
    if (progress >= 50) return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalTopBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Minhas Metas
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe seu desempenho e progresso nas metas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Meta de Hoje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Meta de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendido</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.vendidoHoje)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.metaHoje)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-medium">{progressoHoje.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(progressoHoje, 100)} className={getProgressColor(progressoHoje)} />
              </div>

              {progressoHoje >= 100 ? (
                <Badge className="w-full justify-center bg-green-500">
                  <Award className="h-4 w-4 mr-2" />
                  Meta Atingida! 🎉
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Faltam {formatCurrency(Math.max(0, stats.metaHoje - stats.vendidoHoje))} para atingir a meta
                </p>
              )}
            </CardContent>
          </Card>

          {/* Meta do Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Meta do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendido</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.vendidoMes)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.metaMes)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-medium">{progressoMes.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(progressoMes, 100)} className={getProgressColor(progressoMes)} />
              </div>

              {progressoMes >= 100 ? (
                <Badge className="w-full justify-center bg-green-500">
                  <Award className="h-4 w-4 mr-2" />
                  Meta Mensal Atingida! 🏆
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Faltam {formatCurrency(Math.max(0, stats.metaMes - stats.vendidoMes))} para atingir a meta
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Metas */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Metas</CardTitle>
            <CardDescription>
              Acompanhe suas metas diárias dos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : metas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta cadastrada</p>
                <p className="text-sm mt-2">Suas metas aparecerão aqui quando forem definidas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metas.map((meta) => {
                  const vendasDia = vendas.filter(v => v.data_hora.startsWith(meta.data));
                  const vendidoDia = vendasDia.reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0);
                  const progressoDia = (vendidoDia / meta.valor_meta) * 100;
                  const atingida = progressoDia >= 100;

                  return (
                    <div key={meta.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(meta.data + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Meta: {formatCurrency(meta.valor_meta)}
                            </p>
                          </div>
                        </div>
                        {atingida && (
                          <Badge className="bg-green-500">
                            <Award className="h-3 w-3 mr-1" />
                            Atingida
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Vendido: {formatCurrency(vendidoDia)}</span>
                          <span className="font-medium">{progressoDia.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(progressoDia, 100)} className={getProgressColor(progressoDia)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
