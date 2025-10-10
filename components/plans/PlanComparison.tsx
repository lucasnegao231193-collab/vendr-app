/**
 * Sistema de Planos - Comparação e Upgrade
 */
"use client";

import { motion } from "framer-motion";
import { Check, Zap, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  vendedoresMax: number;
  features: string[];
  recommended?: boolean;
  icon: React.ElementType;
  color: string;
}

const plans: Plan[] = [
  {
    id: "basico",
    name: "Plano Básico",
    price: 49.90,
    priceLabel: "/mês",
    vendedoresMax: 5,
    features: [
      "Até 5 vendedores",
      "Dashboard básico",
      "Relatórios mensais",
      "Suporte por email",
    ],
    icon: Zap,
    color: "trust-blue-500",
  },
  {
    id: "profissional",
    name: "Plano Profissional",
    price: 99.90,
    priceLabel: "/mês",
    vendedoresMax: 20,
    features: [
      "Até 20 vendedores",
      "Dashboard completo",
      "Relatórios em tempo real",
      "Sistema de transferências",
      "Gamificação",
      "Suporte prioritário",
    ],
    recommended: true,
    icon: Star,
    color: "venlo-orange-500",
  },
  {
    id: "empresarial",
    name: "Plano Empresarial",
    price: 199.90,
    priceLabel: "/mês",
    vendedoresMax: 100,
    features: [
      "Até 100+ vendedores",
      "Tudo do Profissional",
      "API completa",
      "White label",
      "Integrações personalizadas",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
    icon: Crown,
    color: "gold",
  },
];

interface PlanComparisonProps {
  currentPlan?: string;
  onSelectPlan?: (planId: string) => void;
}

export function PlanComparison({ 
  currentPlan = "basico",
  onSelectPlan 
}: PlanComparisonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-trust-blue-900 dark:text-white">
          Escolha o Plano Ideal
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Escale seu negócio com as melhores ferramentas
        </p>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const isRecommended = plan.recommended;
          const isCurrent = currentPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Badge Recomendado */}
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-venlo-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    ⭐ Recomendado
                  </span>
                </div>
              )}

              <Card
                className={cn(
                  "relative overflow-hidden transition-all h-full",
                  isRecommended
                    ? "border-2 border-venlo-orange-500 shadow-xl scale-105"
                    : "border-gray-200 dark:border-trust-blue-700 hover:shadow-lg",
                  isCurrent && "ring-2 ring-success"
                )}
              >
                <CardHeader className="text-center pb-8 pt-8">
                  {/* Ícone */}
                  <div className="mx-auto mb-4">
                    <div
                      className={cn(
                        "h-16 w-16 rounded-full flex items-center justify-center",
                        `bg-${plan.color}/10`
                      )}
                    >
                      <Icon className={cn("h-8 w-8", `text-${plan.color}`)} />
                    </div>
                  </div>

                  {/* Nome do Plano */}
                  <h3 className="text-2xl font-bold text-trust-blue-900 dark:text-white">
                    {plan.name}
                  </h3>

                  {/* Preço */}
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-trust-blue-900 dark:text-white">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {plan.priceLabel}
                    </span>
                  </div>

                  {/* Limite Vendedores */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Até {plan.vendedoresMax === 100 ? "100+" : plan.vendedoresMax} vendedores
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 + i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => onSelectPlan?.(plan.id)}
                    disabled={isCurrent}
                    className={cn(
                      "w-full",
                      isRecommended
                        ? "bg-venlo-orange-500 hover:bg-venlo-orange-600 text-white"
                        : isCurrent
                        ? "bg-success text-white cursor-not-allowed"
                        : "bg-trust-blue-900 hover:bg-trust-blue-800 text-white"
                    )}
                  >
                    {isCurrent ? "✓ Plano Atual" : "Escolher Plano"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card className="bg-white dark:bg-trust-blue-800 border-gray-200 dark:border-trust-blue-700 mt-12">
        <CardHeader>
          <h3 className="text-xl font-bold text-trust-blue-900 dark:text-white text-center">
            Comparação Detalhada
          </h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-trust-blue-700">
                  <th className="text-left p-4 text-trust-blue-900 dark:text-white">
                    Funcionalidade
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center p-4 text-trust-blue-900 dark:text-white"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Vendedores", values: ["5", "20", "100+"] },
                  { feature: "Dashboard", values: ["Básico", "Completo", "Completo"] },
                  { feature: "Relatórios", values: ["Mensais", "Tempo Real", "Tempo Real"] },
                  { feature: "Transferências", values: ["❌", "✅", "✅"] },
                  { feature: "Gamificação", values: ["❌", "✅", "✅"] },
                  { feature: "API", values: ["❌", "❌", "✅"] },
                  { feature: "White Label", values: ["❌", "❌", "✅"] },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-trust-blue-700 last:border-0"
                  >
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {row.feature}
                    </td>
                    {row.values.map((value, i) => (
                      <td
                        key={i}
                        className="p-4 text-center text-gray-700 dark:text-gray-300"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
