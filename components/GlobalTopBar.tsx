/**
 * GlobalTopBar - Barra superior azul consistente em todas as páginas
 * Cor primária: #0057FF
 * Sem botão Suporte (movido para Configurações)
 */
"use client";

import { ArrowLeft, Home, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

interface GlobalTopBarProps {
  userName?: string;
  avatarUrl?: string;
  role?: 'owner' | 'seller' | 'autonomo';
}

export function GlobalTopBar({ userName, avatarUrl, role = 'owner' }: GlobalTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    // Redirecionar baseado no role/pathname
    if (pathname.startsWith("/solo")) {
      router.push("/solo");
    } else if (pathname.startsWith("/vendedor")) {
      router.push("/vendedor");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName = userName || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const roleLabel = role === 'owner' ? 'Empresa' : role === 'seller' ? 'Vendedor' : 'Autônomo';

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-white/10 shadow-md"
      style={{ backgroundColor: 'hsl(var(--primary))' }}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-screen-2xl mx-auto">
        {/* Left: Back Button + Logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Voltar"
            className="text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <button
            onClick={handleHome}
            aria-label="Ir para início"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" variant="white" />
          </button>
        </div>

        {/* Right: Home Button + Settings + User Menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="text-white hover:bg-white/10 hidden sm:flex"
            aria-label="Dashboard"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/configuracoes')}
            className="text-white hover:bg-white/10"
            aria-label="Configurações"
          >
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Configurações</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full hover:bg-white/10"
                aria-label="Menu do usuário"
              >
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/configuracoes')}>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/configuracoes/suporte')}>
                Suporte
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
