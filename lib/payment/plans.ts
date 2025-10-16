/**
 * Planos de Assinatura do Venlo
 */

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId?: string;
  mercadoPagoPlanId?: string;
  limits: {
    users?: number;
    products?: number;
    sales?: number;
    storage?: number; // GB
  };
}

export const PLANS: Record<string, Plan> = {
  // Plano Solo (Autônomo)
  solo_free: {
    id: 'solo_free',
    name: 'Solo Grátis',
    description: 'Perfeito para começar',
    price: 0,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 30 vendas por mês',
      'Gestão de estoque básica',
      'Relatórios simples',
      'Suporte por email',
    ],
    limits: {
      sales: 30,
      products: 50,
      storage: 1,
    },
  },
  solo_pro: {
    id: 'solo_pro',
    name: 'Solo Pro',
    description: 'Para autônomos profissionais',
    price: 29.90,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Vendas ilimitadas',
      'Gestão completa de estoque',
      'Relatórios avançados',
      'Suporte prioritário',
      'Backup automático',
      'Integração com WhatsApp',
    ],
    stripePriceId: process.env.STRIPE_SOLO_PRO_PRICE_ID,
    mercadoPagoPlanId: process.env.MP_SOLO_PRO_PLAN_ID,
    limits: {
      products: 500,
      storage: 5,
    },
  },

  // Planos Empresa
  empresa_starter: {
    id: 'empresa_starter',
    name: 'Empresa Starter',
    description: 'Para pequenas equipes',
    price: 99.90,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 5 vendedores',
      'Vendas ilimitadas',
      'Gestão completa de estoque',
      'Transferências entre vendedores',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    stripePriceId: process.env.STRIPE_EMPRESA_STARTER_PRICE_ID,
    mercadoPagoPlanId: process.env.MP_EMPRESA_STARTER_PLAN_ID,
    limits: {
      users: 5,
      products: 1000,
      storage: 10,
    },
  },
  empresa_pro: {
    id: 'empresa_pro',
    name: 'Empresa Pro',
    description: 'Para equipes em crescimento',
    price: 249.90,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 20 vendedores',
      'Tudo do Starter +',
      'Dashboard personalizado',
      'API de integração',
      'Webhooks',
      'Suporte 24/7',
      'Treinamento da equipe',
    ],
    stripePriceId: process.env.STRIPE_EMPRESA_PRO_PRICE_ID,
    mercadoPagoPlanId: process.env.MP_EMPRESA_PRO_PLAN_ID,
    limits: {
      users: 20,
      products: 5000,
      storage: 50,
    },
  },
  empresa_enterprise: {
    id: 'empresa_enterprise',
    name: 'Empresa Enterprise',
    description: 'Solução completa',
    price: 599.90,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Vendedores ilimitados',
      'Tudo do Pro +',
      'Servidor dedicado',
      'Customizações',
      'SLA garantido',
      'Gerente de conta dedicado',
      'Consultoria estratégica',
    ],
    stripePriceId: process.env.STRIPE_EMPRESA_ENTERPRISE_PRICE_ID,
    mercadoPagoPlanId: process.env.MP_EMPRESA_ENTERPRISE_PLAN_ID,
    limits: {
      storage: 200,
    },
  },
};

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId];
}

export function getPlansByType(type: 'solo' | 'empresa'): Plan[] {
  return Object.values(PLANS).filter(plan => plan.id.startsWith(type));
}

export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
}
