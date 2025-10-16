/**
 * Página de Chat Compartilhado
 * Permite que outras pessoas vejam e interajam com um chat compartilhado
 */
"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { MessageCircle } from "lucide-react";

export default function SharedChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <Logo size="md" />
          </div>
          <CardTitle className="text-center">Chat Compartilhado</CardTitle>
          <CardDescription className="text-center">
            Alguém compartilhou esta conversa com você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <MessageCircle className="h-16 w-16 text-primary opacity-50" />
            <p className="text-center text-muted-foreground">
              ID do Chat: <span className="font-mono font-bold">{chatId}</span>
            </p>
            <p className="text-sm text-center text-muted-foreground max-w-md">
              Esta funcionalidade permite que você visualize e interaja com conversas
              compartilhadas. Em breve, você poderá fazer perguntas e receber respostas
              do nosso chatbot inteligente!
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">🚀 Funcionalidade em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground">
              Estamos trabalhando para trazer a melhor experiência de chat compartilhado.
              Em breve você poderá:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
              <li>Ver o histórico completo da conversa</li>
              <li>Fazer suas próprias perguntas</li>
              <li>Salvar conversas importantes</li>
              <li>Compartilhar com outras pessoas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
