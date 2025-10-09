/**
 * TransferList - Lista de transferências com filtros
 */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransferListProps {
  transferencias: any[];
  onUpdate: () => void;
}

export function TransferList({ transferencias, onUpdate }: TransferListProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      aguardando_aceite: { variant: "secondary", label: "Aguardando" },
      aceito: { variant: "default", label: "Aceito" },
      recusado: { variant: "destructive", label: "Recusado" },
      cancelado: { variant: "outline", label: "Cancelado" },
    };

    const config = variants[status] || variants.aguardando_aceite;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  if (transferencias.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma transferência encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transferencias.map((transfer) => (
        <div
          key={transfer.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold">
                  {transfer.vendedor?.nome || "Vendedor desconhecido"}
                </h4>
                {getStatusBadge(transfer.status)}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {transfer.total_itens} {transfer.total_itens === 1 ? 'item' : 'itens'}
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(transfer.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>

              {transfer.observacao && (
                <p className="text-sm text-muted-foreground italic">
                  "{transfer.observacao}"
                </p>
              )}

              {/* Lista de Itens */}
              {transfer.itens && transfer.itens.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Produtos:</p>
                  <div className="space-y-1">
                    {transfer.itens.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="text-sm text-muted-foreground">
                        • {item.produto?.nome} - {item.quantidade} un
                      </div>
                    ))}
                    {transfer.itens.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        + {transfer.itens.length - 3} {transfer.itens.length - 3 === 1 ? 'outro' : 'outros'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
