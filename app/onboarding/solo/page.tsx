/**
 * Onboarding para Autônomos (Vendr Solo)
 * Cadastro rápido com email/senha e nome do negócio
 */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, User, Chrome } from "lucide-react";
import { Logo } from "@/components/Logo";
import { soloOnboardingSchema } from "@/lib/solo-schemas";
import Link from "next/link";
import { getOAuthCallbackUrl } from "@/lib/auth-helpers";

export default function SoloOnboardingPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeNegocio, setNomeNegocio] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthCallbackUrl('autonomo'),
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta com Google",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Validar dados
      const validation = soloOnboardingSchema.safeParse({
        email,
        senha,
        nome_negocio: nomeNegocio || undefined,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      // 2. Criar usuário no Supabase Auth
      // O trigger do banco vai criar automaticamente: empresa Solo, perfil e cota
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/solo`,
          data: {
            full_name: nomeNegocio || email.split('@')[0],
            account_type: 'solo', // Indica que é conta Solo
          }
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // Verificar se precisa confirmar email
      if (authData.user.identities && authData.user.identities.length === 0) {
        toast({
          title: "✉️ Confirme seu email",
          description: "Enviamos um link de confirmação. Após confirmar, faça login.",
        });
        router.push('/login');
        return;
      }

      // Se não precisa confirmar, fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        toast({
          title: "✉️ Confirme seu email",
          description: "Enviamos um link de confirmação. Após confirmar, faça login.",
        });
        router.push('/login');
        return;
      }

      // Aguardar trigger criar empresa e perfil
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "✓ Bem-vindo ao Venlo Solo!",
        description: "Sua conta foi criada com sucesso",
      });

      // Redirecionar para dashboard Solo
      router.push("/solo");

    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <Logo size="md" />
          </div>
          <CardTitle className="text-center">Criar Conta Autônomo</CardTitle>
          <CardDescription className="text-center">
            Configure sua conta Solo e comece a vender
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Negócio (opcional)</Label>
              <Input
                id="nome"
                placeholder="Ex: Lanchonete do João"
                value={nomeNegocio}
                onChange={(e) => setNomeNegocio(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Você pode alterar depois
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full vendr-btn-primary" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta Solo (Grátis)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Criar conta com Google
            </Button>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Plano Solo Free inclui:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Até 30 vendas por mês</li>
                <li>✓ Gestão de estoque básica</li>
                <li>✓ Relatórios simples</li>
                <li>✓ Suporte por email</li>
              </ul>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
