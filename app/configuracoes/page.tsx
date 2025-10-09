/**
 * Página de Configurações
 * Tabs: Perfil da Empresa, Equipe, Billing, Integrações, Aparência, Segurança, Suporte
 */
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Plug, 
  Palette, 
  Shield, 
  MessageCircle 
} from "lucide-react";
import { GlobalTopBar } from "@/components/GlobalTopBar";
import { PerfilEmpresaTab } from "@/components/configuracoes/PerfilEmpresaTab";
import { EquipeTab } from "@/components/configuracoes/EquipeTab";
import { BillingTab } from "@/components/configuracoes/BillingTab";
import { IntegracoesTab } from "@/components/configuracoes/IntegracoesTab";
import { AparenciaTab } from "@/components/configuracoes/AparenciaTab";
import { SegurancaTab } from "@/components/configuracoes/SegurancaTab";
import { SuporteTab } from "@/components/configuracoes/SuporteTab";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <div className="min-h-screen bg-background">
      <GlobalTopBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as configurações da sua empresa e preferências
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs List - Responsivo */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2 h-auto bg-muted p-2">
            <TabsTrigger value="perfil" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="equipe" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Equipe</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="integracoes" className="gap-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrações</span>
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

          {/* Tab Content */}
          <TabsContent value="perfil" className="space-y-6">
            <PerfilEmpresaTab />
          </TabsContent>

          <TabsContent value="equipe" className="space-y-6">
            <EquipeTab />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingTab />
          </TabsContent>

          <TabsContent value="integracoes" className="space-y-6">
            <IntegracoesTab />
          </TabsContent>

          <TabsContent value="aparencia" className="space-y-6">
            <AparenciaTab />
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-6">
            <SegurancaTab />
          </TabsContent>

          <TabsContent value="suporte" className="space-y-6">
            <SuporteTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
