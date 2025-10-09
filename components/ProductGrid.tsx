/**
 * Grid de produtos para seleção na venda
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface Product {
  id: string;
  nome: string;
  preco: number;
  unidade: string;
}

interface ProductGridProps {
  produtos: Product[];
  quantidades: Record<string, number>;
  onQuantidadeChange: (produtoId: string, delta: number) => void;
}

export function ProductGrid({ produtos, quantidades, onQuantidadeChange }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {produtos.map((produto) => {
        const qtd = quantidades[produto.id] || 0;

        return (
          <Card
            key={produto.id}
            className={`transition-all ${
              qtd > 0 ? "border-primary border-2 shadow-md" : "hover:border-gray-300"
            }`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{produto.nome}</h3>
                    <p className="text-sm text-muted-foreground">{produto.unidade}</p>
                  </div>
                  {qtd > 0 && (
                    <Badge className="bg-primary text-white">{qtd}</Badge>
                  )}
                </div>

                {/* Preço */}
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(produto.preco)}
                </div>

                {/* Controles */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onQuantidadeChange(produto.id, -1)}
                    disabled={qtd === 0}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <div className="flex-1 text-center font-semibold text-xl">
                    {qtd}
                  </div>

                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => onQuantidadeChange(produto.id, 1)}
                    className="h-10 w-10 vendr-btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Subtotal */}
                {qtd > 0 && (
                  <div className="pt-2 border-t text-sm flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(produto.preco * qtd)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
