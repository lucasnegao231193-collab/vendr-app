/**
 * Painel Venlo - Modo Profissional/Pessoal
 * Dashboard unificado com alternância entre gestão profissional e finanças pessoais
 */
"use client";

import { useVenloMode } from '@/hooks/useVenloMode';
import { ModeSwitch } from '@/components/painel/ModeSwitch';
import { DashboardPessoal } from '@/components/painel/DashboardPessoal';
import { Skeleton } from '@/components/ui/skeleton';

// Importar o dashboard profissional existente (ajustar o caminho conforme necessário)
// import { DashboardProfissional } from '@/components/painel/DashboardProfissional';

export default function PainelVenloPage() {
  const { mode, isLoading } = useVenloMode();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com toggle de modo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'PROFISSIONAL' ? 'Painel Profissional' : 'Finanças Pessoais'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'PROFISSIONAL' 
              ? 'Gestão de vendas, serviços e comissões' 
              : 'Controle financeiro pessoal'}
          </p>
        </div>
        <ModeSwitch />
      </div>

      {/* Conteúdo dinâmico baseado no modo */}
      {mode === 'PROFISSIONAL' ? (
        // TODO: Renderizar dashboard profissional existente
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Dashboard Profissional (importar componente existente)
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Substituir por: {'<DashboardProfissional />'}
          </p>
        </div>
      ) : (
        <DashboardPessoal />
      )}
    </div>
  );
}
