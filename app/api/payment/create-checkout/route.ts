/**
 * API Route: Criar Checkout de Pagamento
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createCheckoutSession, createCustomer } from '@/lib/payment/stripe';
import { getPlan } from '@/lib/payment/plans';

export async function POST(request: NextRequest) {
  try {
    const { planId, provider = 'stripe' } = await request.json();

    // Verificar autenticação
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar plano
    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Buscar ou criar cliente no Stripe
    const { data: empresa } = await supabase
      .from('empresas')
      .select('stripe_customer_id, nome')
      .eq('owner_id', user.id)
      .single();

    let customerId = empresa?.stripe_customer_id;

    if (!customerId && provider === 'stripe') {
      const customer = await createCustomer({
        email: user.email!,
        name: empresa?.nome,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Salvar customer ID
      await supabase
        .from('empresas')
        .update({ stripe_customer_id: customerId })
        .eq('owner_id', user.id);
    }

    // Criar sessão de checkout
    if (provider === 'stripe') {
      const session = await createCheckoutSession({
        priceId: plan.stripePriceId!,
        customerId,
        successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // TODO: Implementar Mercado Pago
    return NextResponse.json(
      { error: 'Provider não suportado' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar checkout' },
      { status: 500 }
    );
  }
}
