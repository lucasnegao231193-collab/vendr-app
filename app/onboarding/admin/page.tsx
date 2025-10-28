/**
 * Onboarding - Criar Conta de Administrador
 * Conta exclusiva para admins, sem empresa/perfil
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Logo } from '@/components/Logo';

export default function AdminOnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar
      if (!email || !senha || !nome) {
        throw new Error('Preencha todos os campos');
      }

      if (senha.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      // Criar usuário com metadata de admin
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: nome,
            account_type: 'admin', // Marca como admin
          }
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // Fazer login automaticamente
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        toast({
          title: "Conta criada!",
          description: "Faça login para acessar como admin.",
        });
        router.push('/login');
        return;
      }

      // Criar admin via API
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome,
          super_admin: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar admin');
      }

      toast({
        title: "✓ Conta Admin Criada!",
        description: "Bem-vindo ao painel administrativo",
      });

      // Redirecionar para admin
      router.push("/admin");

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
    <div className="min-h-screen bg-gradient-to-br from-trust-blue-900 to-trust-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <Logo size="md" />
          </div>
          <CardTitle className="text-center">🛡️ Criar Conta Admin</CardTitle>
          <CardDescription className="text-center">
            Conta exclusiva para administradores do Venlo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@venlo.com"
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
              <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-trust-blue-600 hover:bg-trust-blue-700"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Conta Admin"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <a href="/login" className="text-trust-blue-600 hover:underline">
                  Fazer login
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
