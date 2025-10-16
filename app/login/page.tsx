/**
 * Página de Login com Abas: Empresa / Autônomo / Funcionário
 * Role-based redirect após login
 */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Building2, UserCircle2, User, Chrome } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getOAuthCallbackUrl } from "@/lib/auth-helpers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"empresa" | "autonomo" | "funcionario">("empresa");

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthCallbackUrl(activeTab),
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

      // Buscar perfil para verificar role e empresa
      const { data: perfil } = await supabase
        .from("perfis")
        .select("role, empresa_id")
        .eq("user_id", data.user.id)
        .single();

      if (!perfil) {
        // Novo usuário -> onboarding baseado na aba
        if (activeTab === "autonomo") {
          router.push("/onboarding/solo");
        } else {
          router.push("/onboarding");
        }
        return;
      }

      // Verificar se é empresa Solo
      const { data: empresa } = await supabase
        .from("empresas")
        .select("is_solo")
        .eq("id", perfil.empresa_id)
        .single();

      // Redirecionar baseado no role e tipo de empresa
      if (perfil.role === "owner") {
        if (empresa?.is_solo) {
          toast({
            title: "Bem-vindo ao Venlo Solo!",
            description: "Acesso ao seu painel autônomo",
          });
          router.push("/solo");
        } else {
          toast({
            title: "Bem-vindo!",
            description: "Acesso ao dashboard da empresa",
          });
          router.push("/dashboard");
        }
      } else if (perfil.role === "seller") {
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="empresa" className="gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="autonomo" className="gap-2">
                <User className="h-4 w-4" />
                Autônomo
              </TabsTrigger>
              <TabsTrigger value="funcionario" className="gap-2">
                <UserCircle2 className="h-4 w-4" />
                Funcionário
              </TabsTrigger>
            </TabsList>

            <TabsContent value="empresa" className="space-y-4 mt-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-empresa">Email</Label>
                  <Input
                    id="email-empresa"
                    type="email"
                    placeholder="admin@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-empresa">Senha</Label>
                  <Input
                    id="password-empresa"
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
                  Entrar como Empresa
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

                <div className="flex flex-col gap-2 text-center text-sm">
                  <Link href="/esqueci-senha" className="text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                  <Link href="/onboarding" className="text-primary hover:underline">
                    Criar conta da empresa
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="autonomo" className="space-y-4 mt-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-autonomo">Email</Label>
                  <Input
                    id="email-autonomo"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-autonomo">Senha</Label>
                  <Input
                    id="password-autonomo"
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
                  Entrar como Autônomo
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

                <div className="flex flex-col gap-2 text-center text-sm">
                  <Link href="/esqueci-senha" className="text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                  <Link href="/onboarding/solo" className="text-primary hover:underline">
                    Criar conta de autônomo
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="funcionario" className="space-y-4 mt-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-func">Email</Label>
                  <Input
                    id="email-func"
                    type="email"
                    placeholder="vendedor@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-func">Senha</Label>
                  <Input
                    id="password-func"
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
                  Entrar como Funcionário
                </Button>

                <div className="text-center text-sm">
                  <Link href="/esqueci-senha" className="text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Credenciais fornecidas pela sua empresa</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
