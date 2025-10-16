# 💳 Guia de Integração de Pagamentos - Venlo

## Visão Geral

O Venlo suporta dois provedores de pagamento:
- **Stripe** (Internacional)
- **Mercado Pago** (Brasil)

## 📋 Planos Disponíveis

### Autônomo (Solo)
- **Solo Grátis**: R$ 0/mês - 30 vendas/mês
- **Solo Pro**: R$ 29,90/mês - Vendas ilimitadas

### Empresa
- **Starter**: R$ 99,90/mês - Até 5 vendedores
- **Pro**: R$ 249,90/mês - Até 20 vendedores
- **Enterprise**: R$ 599,90/mês - Vendedores ilimitados

## 🔧 Configuração

### 1. Stripe

1. Crie uma conta em [stripe.com](https://stripe.com)
2. Obtenha suas chaves API (Dashboard > Developers > API keys)
3. Crie produtos e preços no Dashboard
4. Configure webhook endpoint: `https://seu-site.com/api/webhooks/stripe`
5. Adicione as variáveis de ambiente:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SOLO_PRO_PRICE_ID=price_...
STRIPE_EMPRESA_STARTER_PRICE_ID=price_...
STRIPE_EMPRESA_PRO_PRICE_ID=price_...
STRIPE_EMPRESA_ENTERPRISE_PRICE_ID=price_...
```

### 2. Mercado Pago

1. Crie uma conta em [mercadopago.com.br](https://www.mercadopago.com.br)
2. Obtenha seu Access Token (Seu negócio > Configurações > Credenciais)
3. Crie planos de assinatura
4. Configure webhook endpoint: `https://seu-site.com/api/webhooks/mercadopago`
5. Adicione as variáveis de ambiente:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MP_SOLO_PRO_PLAN_ID=plan_...
MP_EMPRESA_STARTER_PLAN_ID=plan_...
MP_EMPRESA_PRO_PLAN_ID=plan_...
MP_EMPRESA_ENTERPRISE_PLAN_ID=plan_...
```

## 🚀 Como Usar

### Criar Checkout

```typescript
const response = await fetch('/api/payment/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planId: 'empresa_pro',
    provider: 'stripe', // ou 'mercadopago'
  }),
});

const { url } = await response.json();
window.location.href = url; // Redireciona para checkout
```

### Verificar Status da Assinatura

```typescript
const { data: empresa } = await supabase
  .from('empresas')
  .select('subscription_status, plano')
  .eq('owner_id', user.id)
  .single();

if (empresa.subscription_status === 'active') {
  // Assinatura ativa
}
```

## 🔔 Webhooks

### Eventos do Stripe

- `checkout.session.completed`: Checkout finalizado
- `customer.subscription.created`: Assinatura criada
- `customer.subscription.updated`: Assinatura atualizada
- `customer.subscription.deleted`: Assinatura cancelada
- `invoice.payment_succeeded`: Pagamento bem-sucedido
- `invoice.payment_failed`: Pagamento falhou

### Eventos do Mercado Pago

- `payment.created`: Pagamento criado
- `payment.updated`: Pagamento atualizado
- `subscription.preapproval_plan.created`: Plano criado
- `subscription.authorized_payment`: Pagamento autorizado

## 📊 Banco de Dados

### Campos Adicionados em `empresas`

```sql
stripe_customer_id TEXT
stripe_subscription_id TEXT
subscription_status TEXT
subscription_current_period_end TIMESTAMPTZ
mercadopago_customer_id TEXT
mercadopago_subscription_id TEXT
```

## 🧪 Testes

### Cartões de Teste (Stripe)

- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

### Cartões de Teste (Mercado Pago)

- **Mastercard**: 5031 4332 1540 6351
- **Visa**: 4509 9535 6623 3704
- **Amex**: 3711 803032 57522

## 🔒 Segurança

- ✅ Webhooks verificados com assinatura
- ✅ Chaves secretas nunca expostas no cliente
- ✅ HTTPS obrigatório em produção
- ✅ Tokens de acesso com escopo limitado

## 📚 Recursos

- [Stripe Documentation](https://stripe.com/docs)
- [Mercado Pago Documentation](https://www.mercadopago.com.br/developers)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Mercado Pago Testing](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing)
