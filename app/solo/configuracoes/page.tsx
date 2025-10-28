/**
 * Página de Configurações - Modo Solo
 * Versão simplificada para autônomos
 */
"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Palette, 
  Shield, 
  MessageCircle,
  Bot
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/ChatbotWidget";

export default function SoloConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas configurações e preferências
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs List - Responsivo */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto bg-muted p-2">
            <TabsTrigger value="perfil" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="suporte" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Suporte</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize seus dados pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button>Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content - Aparência */}
          <TabsContent value="aparencia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tema</CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configurações de tema em breve...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content - Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Mantenha sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input id="senha-atual" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input id="nova-senha" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                  <Input id="confirmar-senha" type="password" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button>Alterar Senha</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content - Suporte */}
          <TabsContent value="suporte" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
                <CardDescription>
                  Entre em contato conosco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>E-mail:</strong> suporte@venlo.com.br
                    </p>
                    <p className="text-sm">
                      <strong>WhatsApp:</strong> (13) 98140-1945
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => setShowChatbot(!showChatbot)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Bot className="h-5 w-5 mr-2" />
                      {showChatbot ? 'Fechar Chat IA' : 'Falar com Assistente IA'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Tire suas dúvidas com nosso assistente inteligente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Chatbot Widget - Apenas quando ativado */}
      {showChatbot && <ChatbotWidget />}
    </div>
  );
}
