/**
 * Página de Seleção de Tipo de Conta
 * Usuário escolhe entre Pessoal (Autônomo) ou Empresa
 */
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function CadastroPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
          <div className="flex items-center justify-center w-full">
            <Logo size="lg" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Criar Nova Conta</h1>
            <CardDescription>
              Escolha o tipo de conta que deseja criar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 pb-8">
          {/* Modo Pessoal (Autônomo) */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
            onClick={() => router.push("/onboarding/solo")}
          >
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Modo Pessoal</h3>
                <p className="text-sm text-muted-foreground">
                  Para autônomos e profissionais independentes
                </p>
              </div>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Gestão individual de vendas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Controle de estoque pessoal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Relatórios simplificados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Ideal para começar</span>
                </li>
              </ul>
              <Button className="w-full vendr-btn-primary">
                Criar Conta Pessoal
              </Button>
            </CardContent>
          </Card>

          {/* Modo Empresa */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
            onClick={() => router.push("/onboarding")}
          >
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Modo Empresa</h3>
                <p className="text-sm text-muted-foreground">
                  Para empresas com equipe de vendas
                </p>
              </div>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Gestão de múltiplos vendedores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Controle de estoque centralizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Relatórios completos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Dashboard administrativo</span>
                </li>
              </ul>
              <Button className="w-full vendr-btn-primary">
                Criar Conta Empresa
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
