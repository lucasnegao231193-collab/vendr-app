/**
 * Página de Onboarding: criar empresa e perfil após primeiro login
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
import { Loader2, Chrome } from "lucide-react";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { getOAuthCallbackUrl } from "@/lib/auth-helpers";

export default function OnboardingPage() {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [chavePix, setChavePix] = useState("");
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
          redirectTo: getOAuthCallbackUrl('empresa'),
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado");

      // Criar empresa
      const { data: empresa, error: empresaError } = await supabase
        .from("empresas")
        .insert({
          owner_id: user.id,
          nome: nomeEmpresa,
          cnpj_cpf: cnpjCpf,
          chave_pix: chavePix,
        })
        .select()
        .single();

      if (empresaError) throw empresaError;

      // Criar perfil
      const { error: perfilError } = await supabase.from("perfis").insert({
        user_id: user.id,
        empresa_id: empresa.id,
        role: "owner",
      });

      if (perfilError) throw perfilError;

      toast({
        title: "Empresa criada!",
        description: "Bem-vindo ao Vendr",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar empresa",
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
          <CardTitle className="text-center">Configurar sua Empresa</CardTitle>
          <CardDescription>
            Configure os dados da sua empresa para começar a usar o Vendr
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                placeholder="Minha Empresa LTDA"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ/CPF</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={cnpjCpf}
                onChange={(e) => setCnpjCpf(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix">Chave PIX</Label>
              <Input
                id="pix"
                placeholder="sua-chave@pix.com"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Chave PIX para receber pagamentos dos clientes
              </p>
            </div>

            <Button type="submit" className="w-full vendr-btn-primary" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Empresa
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

            <div className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Já tem uma conta? Faça login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
