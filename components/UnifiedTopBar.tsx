/**
 * UnifiedTopBar - TopBar padrão para todos os painéis
 * Com logo branco, busca global e menu do usuário
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Settings, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { createClient } from "@/lib/supabase-browser";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UnifiedTopBarProps {
  userName?: string;
  userRole?: string;
}

export function UnifiedTopBar({ userName, userRole }: UnifiedTopBarProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  // Cmd+K / Ctrl+K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSettings = () => {
    if (userRole === 'autonomo') {
      router.push('/solo/configuracoes');
    } else {
      router.push('/configuracoes');
    }
  };

  const displayName = userName || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-[#0f172a] border-b border-white/10 fixed top-0 left-0 right-0 z-50">
      <div className="h-full flex items-center justify-between px-6 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/vendr-white-v3.png"
            alt="Venlo"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
            unoptimized
          />
        </div>

        {/* Busca Global */}
        <div className="flex-1 max-w-xl hidden md:block">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full relative group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <div className="w-full pl-10 pr-20 py-2 rounded-lg bg-white/10 border border-white/20 text-left text-gray-400 text-sm group-hover:border-primary transition-colors">
              Buscar...
            </div>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/10 rounded text-xs text-gray-300 border border-white/20">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Dialog de Busca */}
        <GlobalSearch open={showSearch} onOpenChange={setShowSearch} />

        {/* Ações Direita */}
        <div className="flex items-center gap-3">
          {/* Notificações */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-orange-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
