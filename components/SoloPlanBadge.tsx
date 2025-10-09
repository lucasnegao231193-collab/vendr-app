/**
 * Solo Plan Badge
 * Badge mostrando plano atual e uso da cota
 */
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp } from "lucide-react";
import { PlanoType } from "@/types/solo";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface SoloPlanBadgeProps {
  plano: PlanoType;
  vendasMes: number;
  limite: number;
  className?: string;
}

export function SoloPlanBadge({ plano, vendasMes, limite, className = "" }: SoloPlanBadgeProps) {
  const router = useRouter();
  const isFree = plano === 'solo_free';
  const percentual = limite > 0 ? (vendasMes / limite) * 100 : 0;
  const limiteProximo = percentual >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className={limiteProximo ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isFree ? (
                <Badge variant="secondary">Solo Free</Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Solo Pro
                </Badge>
              )}
            </div>
            
            {isFree && (
              <Button
                size="sm"
                onClick={() => router.push('/solo/assinatura')}
                className="bg-gradient-to-r from-[#0057FF] to-[#FF6B00] text-white hover:opacity-90"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>

          {isFree && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Vendas neste mês:
                  </span>
                  <span className={`font-semibold ${limiteProximo ? 'text-orange-600' : ''}`}>
                    {vendasMes} / {limite}
                  </span>
                </div>
                <Progress 
                  value={percentual} 
                  className={limiteProximo ? "bg-orange-200" : ""}
                />
              </div>

              {limiteProximo && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  ⚠️ Você está próximo do limite mensal
                </p>
              )}

              {vendasMes >= limite && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    ❌ Limite atingido! Faça upgrade para continuar vendendo.
                  </p>
                </div>
              )}
            </>
          )}

          {!isFree && (
            <p className="text-sm text-muted-foreground">
              ✓ Vendas ilimitadas • Relatórios avançados
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
