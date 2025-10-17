/**
 * Integração com Stripe
 */
import Stripe from 'stripe';

// Stripe é opcional - só será usado se a chave estiver configurada
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

export const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null;

// Helper para verificar se Stripe está configurado
function ensureStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe não está configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente.');
  }
  return stripe;
}

/**
 * Criar sessão de checkout
 */
export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripeClient = ensureStripe();
  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata,
    },
  });

  return session;
}

/**
 * Criar cliente no Stripe
 */
export async function createCustomer({
  email,
  name,
  metadata,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  const stripeClient = ensureStripe();
  const customer = await stripeClient.customers.create({
    email,
    name,
    metadata,
  });

  return customer;
}

/**
 * Criar portal do cliente
 */
export async function createCustomerPortal({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const stripeClient = ensureStripe();
  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Cancelar assinatura
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripeClient = ensureStripe();
  const subscription = await stripeClient.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Atualizar assinatura
 */
export async function updateSubscription({
  subscriptionId,
  priceId,
}: {
  subscriptionId: string;
  priceId: string;
}) {
  const stripeClient = ensureStripe();
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  
  const updatedSubscription = await stripeClient.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });

  return updatedSubscription;
}

/**
 * Verificar status da assinatura
 */
export async function getSubscription(subscriptionId: string) {
  const stripeClient = ensureStripe();
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  return subscription;
}

/**
 * Listar assinaturas de um cliente
 */
export async function listCustomerSubscriptions(customerId: string) {
  const stripeClient = ensureStripe();
  const subscriptions = await stripeClient.subscriptions.list({
    customer: customerId,
    status: 'all',
  });

  return subscriptions.data;
}
