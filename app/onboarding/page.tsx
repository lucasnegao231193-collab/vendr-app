/**
 * Página de Cadastro de Empresa
 * Cria conta com email/senha e dados da empresa
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
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function OnboardingPage() {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // 2. Fazer login imediatamente
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) console.warn('Login após signup falhou:', signInError);

      // 3. Criar empresa
      const { data: empresa, error: empresaError } = await supabase
        .from("empresas")
        .insert({
          owner_id: authData.user.id,
          nome: nomeEmpresa,
          cnpj_cpf: cnpjCpf,
          telefone: telefone,
        })
        .select()
        .single();

      if (empresaError) throw empresaError;

      // 4. Criar perfil
      const { error: perfilError } = await supabase.from("perfis").insert({
        user_id: authData.user.id,
        empresa_id: empresa.id,
        nome: nomeEmpresa,
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
          <CardTitle className="text-center">Criar Conta da Empresa</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados para começar a usar o Vendr
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
              <Label htmlFor="cnpj">CNPJ/CPF *</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={cnpjCpf}
                onChange={(e) => setCnpjCpf(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@empresa.com"
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
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            <Button type="submit" className="w-full vendr-btn-primary" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta da Empresa
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
