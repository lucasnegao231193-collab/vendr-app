/**
 * Modal para pagamento PIX com QR Code e Copia e Cola
 */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, generatePixPayload } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import QRCode from "qrcode";

interface PixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valor: number;
  onConfirm?: () => void;
}

export function PixModal({ open, onOpenChange, valor, onConfirm }: PixModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const pixKey = process.env.NEXT_PUBLIC_VENDR_PIX_KEY || "vendedor@pix.com";
  const pixPayload = generatePixPayload(pixKey, valor);

  useEffect(() => {
    if (open) {
      // Gerar QR Code
      QRCode.toDataURL(pixPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then(setQrCodeUrl)
        .catch(console.error);

      // Reset estado
      setCopied(false);
      setConfirmed(false);
    }
  }, [open, pixPayload]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm?.();
    setTimeout(() => {
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
          <DialogDescription>
            Valor: <span className="font-bold text-lg">{formatCurrency(valor)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code PIX" className="w-64 h-64 border rounded-lg" />
            ) : (
              <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-gray-50">
                Gerando QR Code...
              </div>
            )}
          </div>

          {/* Pix Copia e Cola */}
          <div className="space-y-2">
            <Label htmlFor="pix-payload">PIX Copia e Cola</Label>
            <div className="flex gap-2">
              <Input
                id="pix-payload"
                value={pixPayload}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Chave PIX */}
          <div className="text-sm text-muted-foreground text-center">
            Chave PIX: <span className="font-medium">{pixKey}</span>
          </div>

          {/* Confirmação manual (MVP) */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleConfirm}
              disabled={confirmed}
              className="w-full vendr-btn-primary"
            >
              {confirmed ? "✓ Pagamento Confirmado" : "Confirmar Pagamento Recebido"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Clique após receber o pagamento
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
