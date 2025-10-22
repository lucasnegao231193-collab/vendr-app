"use client";

import { useVenloMode } from '@/hooks/useVenloMode';
import { Briefcase, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function ModeSwitch() {
  const { mode, setMode, isLoading } = useVenloMode();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 animate-pulse">
        <div className="h-9 w-32 rounded-md bg-muted-foreground/20" />
        <div className="h-9 w-32 rounded-md bg-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-1 rounded-lg bg-muted p-1"
      role="tablist"
      aria-label="Modo do painel"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'PROFISSIONAL'}
        aria-label="Modo Profissional"
        onClick={() => {
          console.log('🔄 Clicou em PROFISSIONAL');
          setMode('PROFISSIONAL');
          console.log('🔄 Chamando reload...');
          setTimeout(() => {
            console.log('🔄 Executando reload agora!');
            window.location.reload();
          }, 50);
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          mode === 'PROFISSIONAL'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Briefcase className="h-4 w-4" />
        <span>Profissional</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={mode === 'PESSOAL'}
        aria-label="Modo Pessoal"
        onClick={() => {
          console.log('🔄 Clicou em PESSOAL');
          setMode('PESSOAL');
          console.log('🔄 Chamando reload...');
          setTimeout(() => {
            console.log('🔄 Executando reload agora!');
            window.location.reload();
          }, 50);
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          mode === 'PESSOAL'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Wallet className="h-4 w-4" />
        <span>Pessoal</span>
      </button>
    </div>
  );
}
