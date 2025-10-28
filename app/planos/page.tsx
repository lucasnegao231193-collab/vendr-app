/**
 * Página de Planos e Preços
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { PLANS, formatPrice, getPlansByType } from "@/lib/payment/plans";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function PlanosPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'solo' | 'empresa'>('empresa');
  const { toast } = useToast();
  const router = useRouter();

  const plans = getPlansByType(planType);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);

    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          provider: 'stripe',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout');
      }

      // Redirecionar para checkout
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Escolha Seu Plano</h1>
          <p className="text-xl text-muted-foreground">
            Planos flexíveis para todos os tamanhos de negócio
          </p>

          {/* Toggle Tipo de Plano */}
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant={planType === 'solo' ? 'default' : 'outline'}
              onClick={() => setPlanType('solo')}
            >
              Autônomo
            </Button>
            <Button
              variant={planType === 'empresa' ? 'default' : 'outline'}
              onClick={() => setPlanType('empresa')}
            >
              Empresa
            </Button>
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.id.includes('pro') ? 'border-primary shadow-lg' : ''
              }`}
            >
              {plan.id.includes('pro') && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limites */}
                {plan.limits && (
                  <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                    {plan.limits.users && (
                      <p>• Até {plan.limits.users} usuários</p>
                    )}
                    {plan.limits.products && (
                      <p>• Até {plan.limits.products} produtos</p>
                    )}
                    {plan.limits.sales && (
                      <p>• Até {plan.limits.sales} vendas/mês</p>
                    )}
                    {plan.limits.storage && (
                      <p>• {plan.limits.storage}GB de armazenamento</p>
                    )}
                  </div>
                )}

                {/* Botão */}
                <Button
                  className="w-full vendr-btn-primary mt-4"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || plan.price === 0}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : plan.price === 0 ? (
                    'Plano Atual'
                  ) : (
                    'Assinar Agora'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-2xl font-bold">Dúvidas Frequentes</h2>
          <div className="max-w-2xl mx-auto text-left space-y-4">
            <div>
              <h3 className="font-semibold">Posso cancelar a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Como funciona o período de teste?</h3>
              <p className="text-muted-foreground">
                Oferecemos 14 dias de teste grátis em todos os planos pagos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Posso mudar de plano depois?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
