/**
 * Página: /empresa/devolucoes
 * Empresa gerencia solicitações de devolução
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { GlobalTopBar } from "@/components/GlobalTopBar";
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
      const response = await fetch('/api/devolucoes/empresa');
      if (!response.ok) throw new Error('Erro ao carregar');
      
      const data = await response.json();
      setDevolucoes(data.devolucoes || []);
      
      // Calcular stats
      const pendentes = data.devolucoes?.filter((d: any) => d.status === 'aguardando_confirmacao').length || 0;
      const aceitas = data.devolucoes?.filter((d: any) => d.status === 'aceita').length || 0;
      const recusadas = data.devolucoes?.filter((d: any) => d.status === 'recusada').length || 0;
      
      setStats({ pendentes, aceitas, recusadas });
    } catch (error) {
      console.error('Erro ao carregar devoluções:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as devoluções",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pendentes = devolucoes.filter(d => d.status === 'aguardando_confirmacao');

  return (
    <div className="min-h-screen bg-background">
      <GlobalTopBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
    </div>
  );
}
