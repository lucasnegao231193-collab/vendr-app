/**
 * Tab: Suporte
 * Formulário de contato, FAQ
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone, Bot } from "lucide-react";
import { ChatbotWidget } from "@/components/ChatbotWidget";

export function SuporteTab() {
  const [showChatbot, setShowChatbot] = useState(false);

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Assistente IA
          </CardTitle>
          <CardDescription>
            Tire suas dúvidas com nosso assistente inteligente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowChatbot(!showChatbot)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Bot className="h-5 w-5 mr-2" />
            {showChatbot ? 'Fechar Chat IA' : 'Falar com Assistente IA'}
          </Button>
        </CardContent>
      </Card>

      {/* Chatbot Widget - Apenas quando ativado */}
      {showChatbot && <ChatbotWidget />}
    </div>
  );
}
