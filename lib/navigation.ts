/**
 * Navigation Utilities
 * Helpers para navegação consistente no app
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type UserRole = 'owner' | 'seller';

/**
 * Retorna a home page baseada no role do usuário
 */
export function getHomeByRole(role: UserRole): string {
  return role === 'owner' ? '/dashboard' : '/vendedor';
}

/**
 * Navega para home com fallback baseado em role
 * Usa router.back() se possível, caso contrário vai para home
 */
export function navigateBack(router: AppRouterInstance, role: UserRole): void {
  // Verificar se há histórico disponível
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back();
  } else {
    // Fallback para home baseado no role
    const home = getHomeByRole(role);
    router.push(home);
  }
}

/**
 * Navega para home baseado no role
 */
export function navigateHome(router: AppRouterInstance, role: UserRole): void {
  const home = getHomeByRole(role);
  router.push(home);
}

/**
 * Gera breadcrumbs a partir do pathname
 */
export function generateBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [
    { label: 'Início', href: '/' }
  ];

  let path = '';
  for (const segment of segments) {
    path += `/${segment}`;
    
    // Mapear segmentos para labels amigáveis
    const labelMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'vendedores': 'Vendedores',
      'estoque': 'Estoque',
      'operacoes': 'Operações',
      'financeiro': 'Financeiro',
      'relatorios': 'Relatórios',
      'configuracoes': 'Configurações',
      'vendedor': 'Vendedor',
      'venda': 'Nova Venda',
      'fechar': 'Fechar Dia',
    };

    breadcrumbs.push({
      label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: path,
    });
  }

  return breadcrumbs;
}
