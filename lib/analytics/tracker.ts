/**
 * Sistema de Analytics Customizado
 */
import * as Sentry from '@sentry/nextjs';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Rastrear evento customizado
 */
export function trackEvent(event: AnalyticsEvent) {
  try {
    // 1. Enviar para Sentry como breadcrumb
    Sentry.addBreadcrumb({
      category: event.category,
      message: event.action,
      level: 'info',
      data: {
        label: event.label,
        value: event.value,
        ...event.metadata,
      },
    });

    // 2. Enviar para Google Analytics (se configurado)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }

    // 3. Enviar para Vercel Analytics (se disponível)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }

    // 4. Salvar no localStorage para análise offline
    saveEventLocally(event);

  } catch (error) {
    console.error('Erro ao rastrear evento:', error);
  }
}

/**
 * Rastrear visualização de página
 */
export function trackPageView(path: string, title?: string) {
  trackEvent({
    category: 'Navigation',
    action: 'page_view',
    label: path,
    metadata: {
      title: title || document.title,
      referrer: document.referrer,
    },
  });
}

/**
 * Rastrear erro
 */
export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });

  trackEvent({
    category: 'Error',
    action: 'error_occurred',
    label: error.message,
    metadata: {
      stack: error.stack,
      ...context,
    },
  });
}

/**
 * Rastrear ação de usuário
 */
export function trackUserAction(action: string, details?: Record<string, any>) {
  trackEvent({
    category: 'User',
    action,
    metadata: details,
  });
}

/**
 * Rastrear conversão
 */
export function trackConversion(type: string, value?: number, details?: Record<string, any>) {
  trackEvent({
    category: 'Conversion',
    action: type,
    value,
    metadata: details,
  });
}

/**
 * Rastrear performance
 */
export function trackPerformance(metric: string, value: number, unit: string = 'ms') {
  trackEvent({
    category: 'Performance',
    action: metric,
    value,
    metadata: {
      unit,
    },
  });
}

/**
 * Configurar contexto do usuário
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  companyId?: string;
}) {
  // Sentry
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });

  Sentry.setContext('user_details', {
    role: user.role,
    company_id: user.companyId,
  });

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', 'user_properties', {
      user_id: user.id,
      user_role: user.role,
    });
  }
}

/**
 * Limpar contexto do usuário (logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Salvar evento localmente para análise offline
 */
function saveEventLocally(event: AnalyticsEvent) {
  try {
    const key = 'venlo_analytics_events';
    const stored = localStorage.getItem(key);
    const events = stored ? JSON.parse(stored) : [];
    
    events.push({
      ...event,
      timestamp: new Date().toISOString(),
    });

    // Manter apenas os últimos 100 eventos
    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem(key, JSON.stringify(events));
  } catch (error) {
    // Ignorar erros de localStorage
  }
}

/**
 * Obter eventos salvos localmente
 */
export function getLocalEvents(): AnalyticsEvent[] {
  try {
    const key = 'venlo_analytics_events';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Limpar eventos locais
 */
export function clearLocalEvents() {
  try {
    localStorage.removeItem('venlo_analytics_events');
  } catch (error) {
    // Ignorar erros
  }
}

/**
 * Eventos pré-definidos para facilitar uso
 */
export const Analytics = {
  // Vendas
  saleCreated: (value: number, productCount: number) => {
    trackConversion('sale_created', value, { product_count: productCount });
  },
  
  saleCompleted: (value: number, paymentMethod: string) => {
    trackConversion('sale_completed', value, { payment_method: paymentMethod });
  },

  // Produtos
  productAdded: (productName: string) => {
    trackUserAction('product_added', { product_name: productName });
  },

  productViewed: (productId: string) => {
    trackUserAction('product_viewed', { product_id: productId });
  },

  // Usuários
  userSignedUp: (method: string) => {
    trackConversion('user_signed_up', undefined, { method });
  },

  userLoggedIn: (method: string) => {
    trackUserAction('user_logged_in', { method });
  },

  // Assinaturas
  subscriptionStarted: (planId: string, value: number) => {
    trackConversion('subscription_started', value, { plan_id: planId });
  },

  subscriptionCanceled: (planId: string, reason?: string) => {
    trackUserAction('subscription_canceled', { plan_id: planId, reason });
  },

  // Relatórios
  reportGenerated: (type: string, format: string) => {
    trackUserAction('report_generated', { type, format });
  },

  reportExported: (type: string, format: string) => {
    trackUserAction('report_exported', { type, format });
  },

  // Notificações
  notificationSent: (channel: string, type: string) => {
    trackUserAction('notification_sent', { channel, type });
  },

  notificationClicked: (notificationId: string) => {
    trackUserAction('notification_clicked', { notification_id: notificationId });
  },

  // Performance
  pageLoadTime: (path: string, time: number) => {
    trackPerformance('page_load_time', time, 'ms');
  },

  apiResponseTime: (endpoint: string, time: number) => {
    trackPerformance('api_response_time', time, 'ms');
  },
};
