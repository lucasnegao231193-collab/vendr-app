/**
 * TopBar Component
 * Barra superior fixa com navegação e ações
 */
"use client";

import { ArrowLeft, Home, LifeBuoy } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigateBack, navigateHome, UserRole } from "@/lib/navigation";
import { openWhatsApp, getContextualMessage } from "@/lib/whatsapp";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase-browser";

interface TopBarProps {
  role: UserRole;
  userName?: string;
}

export function TopBar({ role, userName = "Usuário" }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const supabase = createClient();

  const handleBack = () => {
    navigateBack(router, role);
  };

  const handleHome = () => {
    navigateHome(router, role);
  };

  const handleSupport = () => {
    const phone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '+5511999999999';
    const message = getContextualMessage(role, pathname);

    toast({
      title: "Abrindo WhatsApp...",
      description: "Redirecionando para suporte.",
    });

    openWhatsApp(phone, message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-soft)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Back Button + Logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Voltar"
            className="hover:bg-[var(--bg-soft)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <button
            onClick={handleHome}
            aria-label="Ir para início"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" />
          </button>
        </div>

        {/* Right: Support Button + User Menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSupport}
            className="hidden sm:flex bg-[var(--brand-accent)] text-white border-none hover:bg-[var(--brand-accent)]/90"
          >
            <LifeBuoy className="h-4 w-4 mr-2" />
            Suporte
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[var(--brand-primary)] text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === 'owner' ? 'Empresa' : 'Vendedor'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/configuracoes')}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSupport} className="sm:hidden">
                <LifeBuoy className="h-4 w-4 mr-2" />
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
