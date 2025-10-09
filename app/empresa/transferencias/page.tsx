/**
 * Página: /empresa/transferencias
 * Empresa envia produtos para vendedores
 * - Formulário de envio
 * - Lista de transferências criadas
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, PackageSearch, Clock, CheckCircle, XCircle } from "lucide-react";
import { GlobalTopBar } from "@/components/GlobalTopBar";
import { TransferForm } from "@/components/transferencias/TransferForm";
import { TransferList } from "@/components/transferencias/TransferList";
import { useToast } from "@/components/ui/use-toast";

export default function TransferenciasPage() {
  const [showForm, setShowForm] = useState(false);
  const [transferencias, setTransferencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendentes: 0,
    aceitas: 0,
    recusadas: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTransferencias();
  }, []);

  const loadTransferencias = async () => {
    try {
      const response = await fetch('/api/transferencias/empresa');
      if (!response.ok) throw new Error('Erro ao carregar transferências');
      
      const data = await response.json();
      setTransferencias(data.transferencias || []);
      
      // Calcular stats
      const pendentes = data.transferencias?.filter((t: any) => t.status === 'aguardando_aceite').length || 0;
      const aceitas = data.transferencias?.filter((t: any) => t.status === 'aceito').length || 0;
      const recusadas = data.transferencias?.filter((t: any) => t.status === 'recusado').length || 0;
      
      setStats({ pendentes, aceitas, recusadas });
    } catch (error) {
      console.error('Erro ao carregar transferências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transferências",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferenciaCriada = () => {
    setShowForm(false);
    loadTransferencias();
    toast({
      title: "Sucesso!",
      description: "Transferência enviada para o vendedor",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalTopBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <PackageSearch className="h-8 w-8 text-primary" />
              Transferências de Estoque
            </h1>
            <p className="text-muted-foreground mt-2">
              Envie produtos do seu estoque para vendedores
            </p>
          </div>
          
          <Button 
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Nova Transferência
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Aguardando Aceite
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

        {/* Formulário de Nova Transferência */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nova Transferência</CardTitle>
              <CardDescription>
                Selecione um vendedor e os produtos que deseja enviar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransferForm 
                onSuccess={handleTransferenciaCriada}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Lista de Transferências */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transferências</CardTitle>
            <CardDescription>
              Acompanhe o status de todas as transferências enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <TransferList 
                transferencias={transferencias}
                onUpdate={loadTransferencias}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
