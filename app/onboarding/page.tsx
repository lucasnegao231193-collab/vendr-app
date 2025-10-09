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
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function OnboardingPage() {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
