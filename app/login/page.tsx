/**
 * Página de Login Simplificada
 * Sistema identifica automaticamente o tipo de usuário e redireciona
 */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Chrome } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login (mesmo provider para ambos)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Mostrar aviso se email não confirmado (mas permite login)
      if (!data.user.email_confirmed_at) {
        toast({
          title: "Lembrete",
          description: "Confirme seu email nas configurações para maior segurança.",
          variant: "default",
        });
      }

      console.log("🔍 Login bem-sucedido, verificando tipo de usuário...");
      console.log("🆔 User ID:", data.user.id);

      // PRIMEIRO: Verificar se é admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      console.log("👤 Verificação de admin:", { adminData, adminError });

      if (adminData) {
        console.log("✅ Usuário identificado como ADMIN, redirecionando para /admin");
        toast({
          title: "Bem-vindo Admin!",
          description: "Acesso ao painel administrativo",
        });
        router.push("/admin");
        router.refresh();
        return;
      }

      console.log("ℹ️ Não é admin, verificando perfil normal...");

      // Buscar perfil para verificar role e empresa
      const { data: perfil, error: perfilError } = await supabase
        .from("perfis")
        .select("role, empresa_id")
        .eq("user_id", data.user.id)
        .single();

      console.log("📋 Verificação de perfil:", { perfil, perfilError });

      if (!perfil) {
        console.log("🆕 Novo usuário, redirecionando para onboarding");
        // Novo usuário -> onboarding padrão
        router.push("/onboarding");
        return;
      }

      // Verificar se é empresa Solo
      const { data: empresa } = await supabase
        .from("empresas")
        .select("is_solo")
        .eq("id", perfil.empresa_id)
        .single();

      console.log("🏢 Tipo de empresa:", { is_solo: empresa?.is_solo });

      // Redirecionar baseado no role e tipo de empresa
      if (perfil.role === "owner") {
        if (empresa?.is_solo) {
          console.log("🎯 Redirecionando para /solo");
          toast({
            title: "Bem-vindo ao Venlo Solo!",
            description: "Acesso ao seu painel autônomo",
          });
          router.push("/solo");
        } else {
          console.log("🎯 Redirecionando para /dashboard");
          toast({
            title: "Bem-vindo!",
            description: "Acesso ao dashboard da empresa",
          });
          router.push("/dashboard");
        }
      } else if (perfil.role === "seller") {
        console.log("🎯 Redirecionando para /vendedor");
        toast({
          title: "Olá vendedor!",
          description: "Acesso ao seu painel",
        });
        router.push("/vendedor");
      } else {
        throw new Error("Role não reconhecido");
      }

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.message || "Verifique suas credenciais",
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
            <Logo size="lg" />
          </div>
          <CardDescription className="text-center">
            Sistema de Gestão de Vendas Externas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full vendr-btn-primary" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
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
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continuar com Google
            </Button>

            <div className="flex flex-col gap-2 text-center text-sm mt-4">
              <Link href="/esqueci-senha" className="text-primary hover:underline">
                Esqueci minha senha
              </Link>
              <Link href="/cadastro" className="text-primary hover:underline">
                Criar nova conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
