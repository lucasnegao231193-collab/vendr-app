/**
 * Tab: Integrações
 * Stripe, WhatsApp, Export CSV
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plug } from "lucide-react";

export function IntegracoesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          Integrações
        </CardTitle>
        <CardDescription>
          Conecte serviços externos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stripe */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Stripe</h4>
            <p className="text-sm text-muted-foreground">Processar pagamentos</p>
          </div>
          <Button variant="outline">Conectar</Button>
        </div>

        {/* WhatsApp API */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">WhatsApp Business API</h4>
            <p className="text-sm text-muted-foreground">Enviar notificações</p>
          </div>
          <Button variant="outline">Conectar</Button>
        </div>

        {/* Export CSV */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Exportação Automática</h4>
            <p className="text-sm text-muted-foreground">CSV diário por email</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
