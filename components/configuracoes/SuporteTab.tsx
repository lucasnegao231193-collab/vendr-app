/**
 * Tab: Suporte
 * Formulário de contato, FAQ
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone } from "lucide-react";

export function SuporteTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contato
          </CardTitle>
          <CardDescription>
            Entre em contato com nossa equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input id="assunto" placeholder="Digite o assunto" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              placeholder="Descreva sua dúvida ou problema"
              rows={5}
            />
          </div>

          <Button className="w-full gap-2">
            <Send className="h-4 w-4" />
            Enviar Mensagem
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outros Canais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => window.open('https://wa.me/5513981401945', '_blank')}
          >
            <Phone className="h-4 w-4" />
            WhatsApp: +55 13 98140-1945
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>📧 Email: suporte@vendr.com.br</p>
            <p>⏰ Horário: Segunda a Sexta, 9h às 18h</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
