/**
 * Auth Helpers
 * Funções auxiliares para autenticação
 */

/**
 * Retorna a URL base do site
 * Prioriza NEXT_PUBLIC_SITE_URL, depois vercel, depois window.location
 */
export function getSiteUrl(): string {
  // 1. Variável de ambiente explícita (Netlify/Vercel)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 2. Vercel URL automática
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // 3. Netlify URL automática
  if (process.env.NEXT_PUBLIC_NETLIFY_URL) {
    return `https://${process.env.NEXT_PUBLIC_NETLIFY_URL}`;
  }

  // 4. Fallback para window.location (apenas no browser)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 5. Fallback final (não deveria chegar aqui em produção)
  return 'http://localhost:3000';
}

/**
 * Retorna a URL de callback do OAuth
 */
export function getOAuthCallbackUrl(type: 'empresa' | 'autonomo' | 'funcionario'): string {
  return `${getSiteUrl()}/auth/callback?type=${type}`;
}
