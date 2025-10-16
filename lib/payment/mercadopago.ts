/**
 * Integração com Mercado Pago
 */
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN não está definida');
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

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
  const preference = await preferenceClient.create({
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
  const preference = await preferenceClient.create({
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
  const payment = await paymentClient.get({ id: paymentId });
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
