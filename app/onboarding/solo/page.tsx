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
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            account_type: 'solo',
          },
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
      console.log('🚀 Iniciando cadastro Solo...');
      
      // 1. Validar dados
      if (!email || !senha) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      if (senha.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      console.log('✅ Validação OK');

      // 2. Tentar fazer login primeiro (verificar se já existe)
      console.log('🔍 Verificando se usuário já existe...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      let userId: string;

      if (loginData?.user) {
        // Usuário já existe, usar ele
        console.log('✅ Usuário já existe, fazendo login...');
        userId = loginData.user.id;
      } else {
        // Usuário não existe, criar diretamente
        console.log('📝 Criando novo usuário...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: `${window.location.origin}/solo`,
            data: {
              full_name: nomeNegocio || email.split('@')[0],
              account_type: 'solo',
            }
          }
        });

        if (signUpError) {
          console.error('❌ Erro ao criar usuário:', signUpError);
          throw new Error(`Não foi possível criar sua conta: ${signUpError.message}`);
        }

        if (!signUpData.user) {
          throw new Error('Erro ao criar usuário');
        }

        console.log('✅ Usuário criado:', signUpData.user.id);
        userId = signUpData.user.id;

        // Fazer login
        console.log('🔐 Fazendo login...');
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (signInError) {
          console.error('❌ Erro no login:', signInError);
          toast({
            title: "Conta criada!",
            description: "Faça login para acessar sua conta.",
          });
          router.push('/login');
          return;
        }

        console.log('✅ Login realizado!');
      }

      console.log('✅ Autenticado! User ID:', userId);

      // 3. Verificar se já tem empresa
      const { data: perfilExistente } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', userId)
        .single();

      if (perfilExistente?.empresa_id) {
        console.log('✅ Usuário já tem empresa, redirecionando...');
        toast({
          title: "Bem-vindo de volta!",
          description: "Você já tem uma conta cadastrada.",
        });
        router.push("/solo");
        return;
      }

      // 4. Criar empresa
      console.log('🏢 Criando empresa...');
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert({
          nome: nomeNegocio || `${email.split('@')[0]} - Solo`,
          is_solo: true,
        })
        .select()
        .single();

      if (empresaError) {
        console.error('❌ Erro ao criar empresa:', empresaError);
        throw new Error('Erro ao criar empresa');
      }

      console.log('✅ Empresa criada:', empresaData.id);

      // 5. Criar perfil
      console.log('👤 Criando perfil...');
      const { error: perfilError } = await supabase
        .from('perfis')
        .insert({
          user_id: userId,
          empresa_id: empresaData.id,
          role: 'owner',
        });

      if (perfilError) {
        console.error('❌ Erro ao criar perfil:', perfilError);
        throw new Error('Erro ao criar perfil');
      }

      console.log('✅ Perfil criado!');

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
