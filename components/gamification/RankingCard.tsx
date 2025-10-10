/**
 * Sistema de Gamificação - Ranking de Vendedores
 */
"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VendedorRanking {
  id: string;
  nome: string;
  vendas: number;
  pontos: number;
  posicao: number;
  variacao: number; // +/- posições vs mês anterior
}

interface RankingCardProps {
  vendedores: VendedorRanking[];
  className?: string;
}

const medalColors = {
  1: { bg: "bg-gold/20", text: "text-gold", border: "border-gold" },
  2: { bg: "bg-silver/20", text: "text-silver", border: "border-silver" },
  3: { bg: "bg-bronze/20", text: "text-bronze", border: "border-bronze" },
};

export function RankingCard({ vendedores, className }: RankingCardProps) {
  return (
    <Card className={cn("bg-white dark:bg-trust-blue-800 border-gray-200 dark:border-trust-blue-700", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-venlo-orange-100 rounded-venlo flex items-center justify-center">
            <Trophy className="h-5 w-5 text-venlo-orange-500" />
          </div>
          <CardTitle className="text-trust-blue-900 dark:text-white">
            Ranking do Mês
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {vendedores.map((vendedor, idx) => {
          const medal = medalColors[vendedor.posicao as keyof typeof medalColors];
          const isTop3 = vendedor.posicao <= 3;

          return (
            <motion.div
              key={vendedor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-venlo-lg border-2 transition-all",
                isTop3
                  ? `${medal.bg} ${medal.border}`
                  : "bg-gray-50 dark:bg-trust-blue-900 border-gray-200 dark:border-trust-blue-700"
              )}
            >
              {/* Posição */}
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0",
                  isTop3
                    ? `${medal.bg} ${medal.text}`
                    : "bg-gray-200 dark:bg-trust-blue-800 text-gray-600 dark:text-gray-400"
                )}
              >
                {vendedor.posicao}
              </div>

              {/* Info Vendedor */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-trust-blue-900 dark:text-white truncate">
                  {vendedor.nome}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  <span>{vendedor.vendas} vendas</span>
                  <span className="text-venlo-orange-500 font-medium">
                    {vendedor.pontos} pts
                  </span>
                </div>
              </div>

              {/* Variação */}
              {vendedor.variacao !== 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                    vendedor.variacao > 0
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  )}
                >
                  {vendedor.variacao > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(vendedor.variacao)}
                </div>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
