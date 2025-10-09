/**
 * Página de Login com Abas: Empresa x Funcionário
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
import { Loader2, Building2, UserCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"empresa" | "funcionario">("empresa");

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

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

      // Buscar perfil para verificar role
      const { data: perfil } = await supabase
        .from("perfis")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (!perfil) {
        // Novo usuário empresa -> onboarding
        router.push("/onboarding");
        return;
      }

      // Redirecionar baseado no role
      if (perfil.role === "owner") {
        toast({
          title: "Bem-vindo!",
          description: "Acesso ao dashboard da empresa",
        });
        router.push("/dashboard");
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
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            <span className="text-primary">Ven</span>
            <span className="text-secondary">dr</span>
          </CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestão de Vendas Externas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="empresa" className="gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
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
