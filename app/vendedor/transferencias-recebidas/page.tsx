/**
 * Página: /vendedor/transferencias-recebidas
 * Vendedor visualiza e aceita/recusa transferências
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, PackageSearch } from "lucide-react";
import { VendedorLayout } from "@/components/VendedorLayout";
import { ReceivedTransferCard } from "@/components/transferencias/ReceivedTransferCard";
import { useToast } from "@/components/ui/use-toast";

export default function TransferenciasRecebidasPage() {
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
      const response = await fetch('/api/transferencias/vendedor?all=true');
      if (!response.ok) throw new Error('Erro ao carregar');
      
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

  const pendentes = transferencias.filter(t => t.status === 'aguardando_aceite');

  return (
    <VendedorLayout>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <PackageSearch className="h-8 w-8 text-primary" />
            Transferências Recebidas
          </h1>
          <p className="text-muted-foreground mt-2">
            Aceite ou recuse produtos enviados pela empresa
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Aguardando Ação
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

        {/* Lista de Transferências Pendentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transferências Pendentes</CardTitle>
                <CardDescription>
                  {pendentes.length} {pendentes.length === 1 ? 'transferência aguardando' : 'transferências aguardando'} sua ação
                </CardDescription>
              </div>
              {stats.pendentes > 0 && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {stats.pendentes}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : pendentes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PackageSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transferência pendente</p>
                <p className="text-sm mt-2">Você será notificado quando a empresa enviar produtos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendentes.map((transfer) => (
                  <ReceivedTransferCard
                    key={transfer.id}
                    transfer={transfer}
                    onUpdate={loadTransferencias}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </VendedorLayout>
  );
}
