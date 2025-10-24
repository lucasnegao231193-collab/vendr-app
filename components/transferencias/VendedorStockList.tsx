/**
 * VendedorStockList - Lista de estoque do vendedor
 * Otimizado com React.memo para evitar re-renders desnecessários
 */
"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Search, RotateCcw } from "lucide-react";

interface VendedorStockListProps {
  estoque: any[];
  onRequestReturn?: (produtoId: string) => void;
}

export const VendedorStockList = memo(function VendedorStockList({ estoque, onRequestReturn }: VendedorStockListProps) {
  const [search, setSearch] = useState("");

  const filtered = estoque.filter(item =>
    item.produto?.nome?.toLowerCase().includes(search.toLowerCase()) ||
    item.produto?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (estoque.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Você ainda não possui produtos em estoque</p>
        <p className="text-sm mt-2">Aguarde transferências da empresa</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou SKU..."
          className="pl-10"
        />
      </div>

      {/* Lista */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Produto</th>
              <th className="text-left p-3 font-medium">SKU</th>
              <th className="text-center p-3 font-medium">Quantidade</th>
              {onRequestReturn && (
                <th className="text-center p-3 font-medium">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{item.produto?.nome}</td>
                <td className="p-3 text-muted-foreground">{item.produto?.sku}</td>
                <td className="p-3 text-center">
                  <Badge variant={item.quantidade < 10 ? "destructive" : "default"}>
                    {item.quantidade}
                  </Badge>
                </td>
                {onRequestReturn && (
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRequestReturn(item.produto_id)}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Devolver
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && search && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum produto encontrado para "{search}"
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total: {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}</span>
        <span>
          Quantidade total: {filtered.reduce((sum, item) => sum + item.quantidade, 0)} unidades
        </span>
      </div>
    </div>
  );
});
