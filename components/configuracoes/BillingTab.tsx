/**
 * Tab: Billing
 * Plano atual, histórico de faturas, upgrade
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export function BillingTab() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plano Atual
          </CardTitle>
          <CardDescription>
            Gerenciar sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">Solo Free</h3>
                <Badge>Grátis</Badge>
              </div>
              <p className="text-muted-foreground mt-1">30 vendas por mês</p>
            </div>
            <Button onClick={() => router.push('/solo/assinatura')} className="gap-2">
              Fazer Upgrade
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Suas últimas transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhuma transação ainda
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
