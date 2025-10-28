/**
 * Webhook do Stripe
 * Processa eventos de pagamento
 */
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Assinatura não encontrada' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Erro ao verificar webhook:', error);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Processar evento
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !planId) {
    console.error('Metadata faltando no checkout');
    return;
  }

  // Atualizar empresa com subscription
  await supabase
    .from('empresas')
    .update({
      plano: planId,
      stripe_subscription_id: session.subscription as string,
      subscription_status: 'active',
    })
    .eq('owner_id', userId);

  console.log(`Checkout completado para usuário ${userId}, plano ${planId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Buscar empresa pelo customer ID
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!empresa) {
    console.error('Empresa não encontrada para customer:', customerId);
    return;
  }

  // Atualizar status da assinatura
  await supabase
    .from('empresas')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', empresa.id);

  console.log(`Assinatura atualizada: ${subscription.id}, status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Buscar empresa
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!empresa) return;

  // Atualizar para plano gratuito
  await supabase
    .from('empresas')
    .update({
      plano: 'solo_free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
    })
    .eq('id', empresa.id);

  console.log(`Assinatura cancelada: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Pagamento bem-sucedido: ${invoice.id}`);
  // Aqui você pode enviar email de confirmação, etc.
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Pagamento falhou: ${invoice.id}`);
  // Aqui você pode enviar email de aviso, etc.
}
