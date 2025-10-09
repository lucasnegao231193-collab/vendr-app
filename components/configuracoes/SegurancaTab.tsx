/**
 * Tab: Segurança & Acesso
 * Gerenciar senhas, sessões ativas, 2FA
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Key, LogOut } from "lucide-react";

export function SegurancaTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Proteja sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Autenticação em Dois Fatores (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Adicione uma camada extra de segurança
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Alterar Senha</Label>
              <p className="text-sm text-muted-foreground">
                Atualizar sua senha de acesso
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Key className="h-4 w-4" />
              Alterar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>
            Dispositivos conectados à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Chrome - Windows</p>
                <p className="text-sm text-muted-foreground">
                  Último acesso: Agora
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive gap-2">
                <LogOut className="h-4 w-4" />
                Encerrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
