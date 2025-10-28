/**
 * AuthenticatedLayout Component
 * Wrapper que verifica autenticação e role, aplica AppShell
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AppShell } from "./layout/AppShell";
import { UserRole } from "@/lib/navigation";
import { Skeleton } from "./ui/skeleton";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthenticatedLayout({ children, requiredRole }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>("");
  
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      // Verificar autenticação
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        router.push('/login');
        return;
      }

      // Buscar perfil do usuário
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('role, empresas(nome)')
        .eq('user_id', authUser.id)
        .single();

      if (perfilError || !perfil) {
        console.error('Erro ao buscar perfil:', perfilError);
        router.push('/login');
        return;
      }

      let userRole = perfil.role as UserRole;

      // IMPORTANTE: Detectar contexto Solo
      // Se o usuário veio de uma rota /solo/* ou se o referrer é /solo/*
      // mantém o contexto Solo mesmo em páginas compartilhadas
      const isSoloContext = pathname.startsWith('/solo') || 
                           (typeof document !== 'undefined' && document.referrer.includes('/solo'));
      
      if (isSoloContext && userRole === 'owner') {
        userRole = 'solo';
      }

      // Verificar se o role é permitido para a rota
      if (requiredRole && userRole !== requiredRole) {
        // Redirecionar para página correta baseado no role
        const redirectPath = userRole === 'owner' ? '/dashboard' : '/vendedor';
        router.push(redirectPath);
        return;
      }

      // Buscar nome do usuário
      let displayName = authUser.email?.split('@')[0] || 'Usuário';
      
      if (userRole === 'owner' && perfil.empresas) {
        displayName = (perfil.empresas as any).nome || displayName;
      } else if (userRole === 'solo') {
        displayName = 'Autônomo';
      } else {
        // Se for vendedor, buscar nome da tabela vendedores
        const { data: vendedor } = await supabase
          .from('vendedores')
          .select('nome')
          .eq('user_id', authUser.id)
          .single();
        
        if (vendedor) {
          displayName = vendedor.nome;
        }
      }

      setUser(authUser);
      setRole(userRole);
      setUserName(displayName);
    } catch (error) {
      console.error('Erro na autenticação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-soft)] flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return (
    <AppShell role={role} userName={userName}>
      {children}
    </AppShell>
  );
}
