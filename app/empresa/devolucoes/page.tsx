/**
 * Página: /empresa/devolucoes
 * Empresa gerencia solicitações de devolução
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { DevolucaoList } from "@/components/transferencias/DevolucaoList";
import { useToast } from "@/components/ui/use-toast";

export default function DevolucoesPag() {
  const [devolucoes, setDevolucoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendentes: 0,
    aceitas: 0,
    recusadas: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDevolucoes();
  }, []);

  const loadDevolucoes = async () => {
    try {
      // Buscar todas as devoluções (sem filtro de status)
      const [pendentesRes, aceitasRes, recusadasRes] = await Promise.all([
        fetch('/api/devolucoes/empresa?status=aguardando_confirmacao'),
        fetch('/api/devolucoes/empresa?status=aceita'),
        fetch('/api/devolucoes/empresa?status=recusada'),
      ]);

      const pendentesData = await pendentesRes.json();
      const aceitasData = await aceitasRes.json();
      const recusadasData = await recusadasRes.json();

      if (!pendentesRes.ok) {
        console.error('Erro ao buscar pendentes:', pendentesData);
        throw new Error(pendentesData.details || pendentesData.error || 'Erro ao carregar');
      }
      
      // Usar apenas as pendentes para exibir
      setDevolucoes(pendentesData.devolucoes || []);
      
      // Calcular stats
      setStats({
        pendentes: pendentesData.count || 0,
        aceitas: aceitasData.count || 0,
        recusadas: recusadasData.count || 0,
      });
    } catch (error: any) {
      console.error('Erro ao carregar devoluções:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar as devoluções",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pendentes = devolucoes.filter(d => d.status === 'aguardando_confirmacao');

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <RotateCcw className="h-8 w-8 text-primary" />
            Solicitações de Devolução
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie devoluções solicitadas pelos vendedores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Aguardando Confirmação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendentes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Aceitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.aceitas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Recusadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.recusadas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Devoluções */}
        <Card>
          <CardHeader>
            <CardTitle>Devoluções Pendentes</CardTitle>
            <CardDescription>
              {pendentes.length} {pendentes.length === 1 ? 'solicitação aguardando' : 'solicitações aguardando'} sua análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DevolucaoList 
                devolucoes={pendentes}
                onUpdate={loadDevolucoes}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
