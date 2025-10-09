/**
 * Card para exibir resumo do vendedor no dashboard
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { User, TrendingUp, Package } from "lucide-react";

interface SellerCardProps {
  nome: string;
  vendidoHoje: number;
  comissaoEstimada: number;
  itensRestantes?: number;
  status?: "ativo" | "inativo" | "fechado";
}

export function SellerCard({
  nome,
  vendidoHoje,
  comissaoEstimada,
  itensRestantes,
  status = "ativo",
}: SellerCardProps) {
  const statusColors = {
    ativo: "bg-green-100 text-green-800 border-green-200",
    inativo: "bg-gray-100 text-gray-800 border-gray-200",
    fechado: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            {nome}
          </CardTitle>
          <Badge className={statusColors[status]} variant="outline">
            {status === "ativo" ? "Ativo" : status === "fechado" ? "Fechado" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Vendido hoje
          </span>
          <span className="font-semibold text-lg">{formatCurrency(vendidoHoje)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Comissão estimada</span>
          <span className="font-medium text-green-600">{formatCurrency(comissaoEstimada)}</span>
        </div>

        {itensRestantes !== undefined && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
              Itens restantes
            </span>
            <span className="font-medium">{itensRestantes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
