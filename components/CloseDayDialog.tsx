/**
 * Dialog para fechamento do dia
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CloseDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendedorId: string;
  vendedorNome: string;
  data: string;
  preview?: {
    total: number;
    total_pix: number;
    total_cartao: number;
    total_dinheiro: number;
    comissao_estimada: number;
  };
  onConfirm?: () => void;
}

export function CloseDayDialog({
  open,
  onOpenChange,
  vendedorId,
  vendedorNome,
  data,
  preview,
  onConfirm,
}: CloseDayDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fechamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendedor_id: vendedorId, data }),
      });

      if (!response.ok) {
        throw new Error("Erro ao fechar dia");
      }

      onConfirm?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao fechar dia:", error);
      alert("Erro ao fechar dia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fechar Dia - {vendedorNome}</DialogTitle>
          <DialogDescription>Data: {new Date(data).toLocaleDateString("pt-BR")}</DialogDescription>
        </DialogHeader>

        {preview ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PIX</span>
                <span className="font-medium">{formatCurrency(preview.total_pix)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cartão</span>
                <span className="font-medium">{formatCurrency(preview.total_cartao)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dinheiro</span>
                <span className="font-medium">{formatCurrency(preview.total_dinheiro)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Vendido</span>
                <span className="text-primary">{formatCurrency(preview.total)}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800">Comissão a Pagar</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(preview.comissao_estimada)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Carregando dados do dia...
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !preview} className="vendr-btn-primary">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Fechamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
