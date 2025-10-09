/**
 * ReceivedTransferCard - Card para vendedor aceitar/recusar transferência
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Package, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface ReceivedTransferCardProps {
  transfer: any;
  onUpdate: () => void;
}

export function ReceivedTransferCard({ transfer, onUpdate }: ReceivedTransferCardProps) {
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transferencias/${transfer.id}/aceitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observacao }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aceitar');
      }

      toast({
        title: "Transferência aceita!",
        description: data.message,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowAccept(false);
    }
  };

  const handleReject = async () => {
    if (!motivo.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Informe o motivo da recusa",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/transferencias/${transfer.id}/recusar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao recusar');
      }

      toast({
        title: "Transferência recusada",
        description: data.message,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowReject(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Transferência da Empresa
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(transfer.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
          <Badge>{transfer.total_itens} {transfer.total_itens === 1 ? 'item' : 'itens'}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de Itens */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-3">Produtos:</h4>
          <div className="space-y-2">
            {transfer.itens?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.produto?.nome}</span>
                <span className="text-muted-foreground">{item.quantidade} un</span>
              </div>
            ))}
          </div>
        </div>

        {/* Observação */}
        {transfer.observacao && (
          <div className="text-sm text-muted-foreground italic">
            "{transfer.observacao}"
          </div>
        )}

        {/* Ações */}
        {!showAccept && !showReject && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAccept(true)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceitar
            </Button>
            <Button
              onClick={() => setShowReject(true)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Recusar
            </Button>
          </div>
        )}

        {/* Formulário Aceitar */}
        {showAccept && (
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Observação (opcional)
              </label>
              <Textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Produtos recebidos em perfeito estado"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? "Aceitando..." : "Confirmar Aceite"}
              </Button>
              <Button
                onClick={() => setShowAccept(false)}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Formulário Recusar */}
        {showReject && (
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Motivo da recusa *
              </label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Produtos danificados, quantidade incorreta..."
                rows={2}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? "Recusando..." : "Confirmar Recusa"}
              </Button>
              <Button
                onClick={() => setShowReject(false)}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
