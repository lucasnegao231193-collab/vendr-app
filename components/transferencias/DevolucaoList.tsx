/**
 * DevolucaoList - Lista de devoluções para empresa
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Calendar, User, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface DevolucaoListProps {
  devolucoes: any[];
  onUpdate: () => void;
}

export function DevolucaoList({ devolucoes, onUpdate }: DevolucaoListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAccept, setShowAccept] = useState<string | null>(null);
  const [showReject, setShowReject] = useState<string | null>(null);
  const [observacao, setObservacao] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async (devolucaoId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/devolucoes/${devolucaoId}/aceitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observacao }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aceitar');
      }

      toast({
        title: "Devolução aceita!",
        description: data.message,
      });

      setShowAccept(null);
      setObservacao("");
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (devolucaoId: string) => {
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
      const response = await fetch(`/api/devolucoes/${devolucaoId}/recusar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao recusar');
      }

      toast({
        title: "Devolução recusada",
        description: data.message,
      });

      setShowReject(null);
      setMotivo("");
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (devolucoes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma devolução encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {devolucoes.map((devolucao) => (
        <div
          key={devolucao.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{devolucao.vendedor?.nome}</span>
                </div>
                <Badge>{devolucao.total_itens} {devolucao.total_itens === 1 ? 'item' : 'itens'}</Badge>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(devolucao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>

              {devolucao.observacao && (
                <p className="text-sm text-muted-foreground italic">
                  Motivo: "{devolucao.observacao}"
                </p>
              )}

              {/* Toggle detalhes */}
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => setExpandedId(expandedId === devolucao.id ? null : devolucao.id)}
              >
                {expandedId === devolucao.id ? 'Ocultar' : 'Ver'} produtos
              </Button>

              {/* Lista de Itens */}
              {expandedId === devolucao.id && devolucao.itens && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Produtos:</p>
                  <div className="space-y-1">
                    {devolucao.itens.map((item: any) => (
                      <div key={item.id} className="text-sm text-muted-foreground">
                        • {item.produto?.nome} - {item.quantidade} un
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              {showAccept !== devolucao.id && showReject !== devolucao.id && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => setShowAccept(devolucao.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowReject(devolucao.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Recusar
                  </Button>
                </div>
              )}

              {/* Form Aceitar */}
              {showAccept === devolucao.id && (
                <div className="space-y-2 mt-3 border-t pt-3">
                  <label className="text-sm font-medium">Observação (opcional)</label>
                  <Textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Ex: Produtos recebidos e reintegrados ao estoque"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(devolucao.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? "Aceitando..." : "Confirmar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAccept(null)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Recusar */}
              {showReject === devolucao.id && (
                <div className="space-y-2 mt-3 border-t pt-3">
                  <label className="text-sm font-medium">Motivo da recusa *</label>
                  <Textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ex: Produtos não podem ser reintegrados..."
                    rows={2}
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(devolucao.id)}
                      disabled={loading}
                    >
                      {loading ? "Recusando..." : "Confirmar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReject(null)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
