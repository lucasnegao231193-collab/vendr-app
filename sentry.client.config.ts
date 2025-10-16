/**
 * Configuração do Sentry para o Cliente
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configurar taxa de amostragem de traces
  tracesSampleRate: 1.0,
  
  // Configurar taxa de amostragem de replays de sessão
  replaysSessionSampleRate: 0.1,
  
  // Configurar taxa de amostragem de replays de erro
  replaysOnErrorSampleRate: 1.0,
  
  // Integração de Replay para capturar sessões
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Ambiente
  environment: process.env.NODE_ENV,
  
  // Filtrar erros conhecidos
  beforeSend(event, hint) {
    // Ignorar erros de extensões do navegador
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message;
        if (message.includes('chrome-extension://') || message.includes('moz-extension://')) {
          return null;
        }
      }
    }
    return event;
  },
  
  // Configurar contexto do usuário
  beforeBreadcrumb(breadcrumb) {
    // Não capturar cliques em elementos sensíveis
    if (breadcrumb.category === 'ui.click') {
      const target = breadcrumb.message;
      if (target?.includes('password') || target?.includes('credit-card')) {
        return null;
      }
    }
    return breadcrumb;
  },
});
