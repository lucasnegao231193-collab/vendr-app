/**
 * Configuração do Sentry para o Servidor
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configurar taxa de amostragem de traces
  tracesSampleRate: 1.0,
  
  // Ambiente
  environment: process.env.NODE_ENV,
  
  // Configurar contexto adicional
  beforeSend(event, hint) {
    // Adicionar informações de contexto
    if (event.request) {
      // Remover informações sensíveis
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }
    return event;
  },
  
  // Integração com Node.js
  integrations: [
    Sentry.httpIntegration(),
  ],
});
