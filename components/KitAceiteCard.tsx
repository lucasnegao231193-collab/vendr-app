/**
 * Card de aceite de estoque para o vendedor
 * Aparece quando há kit pendente
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface KitItem {
  produto_id: string;
  qtd_atribuida: number;
  valor_unit_atribuido: number;
  produtos: {
    nome: string;
    unidade: string;
  };
}

interface Kit {
  id: string;
  data: string;
  assigned_at: string;
  comissao_percent: number;
  kit_itens: KitItem[];
}

interface KitAceiteCardProps {
  kit: Kit;
  onAceite: () => void;
}

export function KitAceiteCard({ kit, onAceite }: KitAceiteCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calcularTotal = () => {
    return kit.kit_itens.reduce(
      (acc, item) => acc + item.qtd_atribuida * item.valor_unit_atribuido,
      0
    );
  };

  const calcularTempoDecorrido = () => {
    const agora = new Date();
    const atribuido = new Date(kit.assigned_at);
    const minutos = Math.floor((agora.getTime() - atribuido.getTime()) / 60000);

    if (minutos < 1) return "agora mesmo";
    if (minutos === 1) return "1 minuto atrás";
    if (minutos < 60) return `${minutos} minutos atrás`;

    const horas = Math.floor(minutos / 60);
    if (horas === 1) return "1 hora atrás";
    return `${horas} horas atrás`;
  };

  const handleAcao = async (acao: "aceitar" | "recusar") => {
    setLoading(true);

    try {
      const response = await fetch("/api/kits/aceite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kit_id: kit.id,
          acao,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar");
      }

      toast({
        title: acao === "aceitar" ? "✓ Estoque aceito!" : "Estoque recusado",
        description: data.message,
      });

      onAceite();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const total = calcularTotal();
  const comissaoEstimada = total * kit.comissao_percent;

  return (
    <Card className="border-2 border-amber-400 bg-amber-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-600" />
              Novo Estoque Atribuído
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              Enviado {calcularTempoDecorrido()}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Pendente
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de itens */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm mb-2">Itens:</h4>
          {kit.kit_itens.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-0">
              <span>
                {item.produtos.nome} × {item.qtd_atribuida}
              </span>
              <span className="font-medium">
                {formatCurrency(item.qtd_atribuida * item.valor_unit_atribuido)}
              </span>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-base font-semibold">
            <span>Valor Total do Estoque</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Sua Comissão ({(kit.comissao_percent * 100).toFixed(1)}%)</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(comissaoEstimada)}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => handleAcao("recusar")}
            disabled={loading}
            className="h-12"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Recusar
          </Button>
          <Button
            onClick={() => handleAcao("aceitar")}
            disabled={loading}
            className="h-12 vendr-btn-primary"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aceitar Estoque
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Ao aceitar, você confirma o recebimento do estoque
        </p>
      </CardContent>
    </Card>
  );
}
