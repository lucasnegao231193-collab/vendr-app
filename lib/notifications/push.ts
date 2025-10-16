/**
 * Sistema de Push Notifications com Web Push
 */
import webpush from 'web-push';

// Configurar VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'contato@venlo.com.br'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Enviar push notification
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  notification: PushNotification
) {
  try {
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/icon-72x72.png',
      data: notification.data,
      actions: notification.actions,
    });

    await webpush.sendNotification(subscription, payload);
    console.log('Push notification enviada');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao enviar push notification:', error);
    
    // Se a subscription expirou, retornar erro específico
    if (error.statusCode === 410) {
      return { success: false, expired: true };
    }
    
    throw error;
  }
}

/**
 * Enviar para múltiplas subscriptions
 */
export async function sendPushToMultiple(
  subscriptions: PushSubscription[],
  notification: PushNotification
) {
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushNotification(sub, notification))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed, total: subscriptions.length };
}

/**
 * Templates de Push Notifications
 */

export function newSalePush(sellerName: string, total: number) {
  return {
    title: '🎉 Nova Venda!',
    body: `${sellerName} realizou uma venda de R$ ${total.toFixed(2)}`,
    icon: '/icon-192x192.png',
    data: {
      type: 'new_sale',
      url: '/dashboard',
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes',
      },
    ],
  };
}

export function lowStockPush(productName: string, quantity: number) {
  return {
    title: '⚠️ Estoque Baixo',
    body: `${productName} está com apenas ${quantity} unidades`,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: {
      type: 'low_stock',
      url: '/estoque',
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Estoque',
      },
    ],
  };
}

export function goalAchievedPush(sellerName: string, goalType: string) {
  return {
    title: '🎯 Meta Atingida!',
    body: `${sellerName} atingiu a meta ${goalType}!`,
    icon: '/icon-192x192.png',
    data: {
      type: 'goal_achieved',
      url: '/dashboard',
    },
    actions: [
      {
        action: 'celebrate',
        title: '🎉 Celebrar',
      },
    ],
  };
}

export function paymentSuccessPush(planName: string, amount: number) {
  return {
    title: '✅ Pagamento Confirmado',
    body: `Seu pagamento de R$ ${amount.toFixed(2)} para o plano ${planName} foi processado`,
    icon: '/icon-192x192.png',
    data: {
      type: 'payment_success',
      url: '/configuracoes',
    },
  };
}

export function paymentFailedPush(planName: string) {
  return {
    title: '❌ Falha no Pagamento',
    body: `Não conseguimos processar seu pagamento para o plano ${planName}`,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: {
      type: 'payment_failed',
      url: '/configuracoes',
    },
    actions: [
      {
        action: 'update',
        title: 'Atualizar Pagamento',
      },
    ],
  };
}

export function newTransferPush(productName: string, quantity: number) {
  return {
    title: '📦 Nova Transferência',
    body: `Você recebeu ${quantity}x ${productName}`,
    icon: '/icon-192x192.png',
    data: {
      type: 'new_transfer',
      url: '/vendedor/estoque',
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Estoque',
      },
    ],
  };
}
