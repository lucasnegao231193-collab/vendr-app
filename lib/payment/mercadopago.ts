/**
 * Integração com Mercado Pago
 */
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Mercado Pago é opcional - só será usado se o token estiver configurado
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

const client = MERCADOPAGO_ACCESS_TOKEN 
  ? new MercadoPagoConfig({
      accessToken: MERCADOPAGO_ACCESS_TOKEN,
    })
  : null;

const preferenceClient = client ? new Preference(client) : null;
const paymentClient = client ? new Payment(client) : null;

// Helper para verificar se Mercado Pago está configurado
function ensureMP() {
  if (!preferenceClient || !paymentClient) {
    throw new Error('Mercado Pago não está configurado. Configure MERCADOPAGO_ACCESS_TOKEN nas variáveis de ambiente.');
  }
  return { preferenceClient, paymentClient };
}

/**
 * Criar preferência de pagamento (assinatura)
 */
export async function createSubscriptionPreference({
  planId,
  reason,
  autoRecurring,
  backUrl,
  metadata,
}: {
  planId: string;
  reason: string;
  autoRecurring: {
    frequency: number;
    frequencyType: 'days' | 'months';
    transactionAmount: number;
    currencyId: string;
  };
  backUrl: {
    success: string;
    failure: string;
    pending: string;
  };
  metadata?: Record<string, any>;
}) {
  const { preferenceClient: mpClient } = ensureMP();
  // @ts-ignore - Mercado Pago SDK tem tipagem incompleta
  const preference = await mpClient.create({
    body: {
      reason,
      auto_recurring: {
        frequency: autoRecurring.frequency,
        frequency_type: autoRecurring.frequencyType,
        transaction_amount: autoRecurring.transactionAmount,
        currency_id: autoRecurring.currencyId,
      },
      back_urls: backUrl,
      metadata,
    },
  });

  return preference;
}

/**
 * Criar preferência de pagamento único
 */
export async function createPaymentPreference({
  items,
  payer,
  backUrls,
  metadata,
}: {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer?: {
    email: string;
    name?: string;
  };
  backUrls?: {
    success: string;
    failure: string;
    pending: string;
  };
  metadata?: Record<string, any>;
}) {
  const { preferenceClient: mpClient } = ensureMP();
  // @ts-ignore - Mercado Pago SDK tem tipagem incompleta
  const preference = await mpClient.create({
    body: {
      items,
      payer,
      back_urls: backUrls,
      metadata,
      auto_return: 'approved',
    },
  });

  return preference;
}

/**
 * Buscar informações de pagamento
 */
export async function getPayment(paymentId: string) {
  const { paymentClient: mpClient } = ensureMP();
  const payment = await mpClient.get({ id: paymentId });
  return payment;
}

/**
 * Cancelar pagamento recorrente
 */
export async function cancelRecurringPayment(paymentId: string) {
  // Mercado Pago usa preauthorized_payments para assinaturas
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${paymentId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    }
  );

  return response.json();
}

/**
 * Buscar assinatura
 */
export async function getSubscription(subscriptionId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );

  return response.json();
}

/**
 * Atualizar assinatura
 */
export async function updateSubscription({
  subscriptionId,
  autoRecurring,
}: {
  subscriptionId: string;
  autoRecurring: {
    transactionAmount: number;
  };
}) {
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${subscriptionId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auto_recurring: {
          transaction_amount: autoRecurring.transactionAmount,
        },
      }),
    }
  );

  return response.json();
}
