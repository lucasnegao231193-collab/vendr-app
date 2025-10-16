-- Adiciona campos de pagamento na tabela empresas

-- Stripe
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Mercado Pago
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS mercadopago_customer_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_subscription_id TEXT;

-- Comentários
COMMENT ON COLUMN empresas.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN empresas.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN empresas.subscription_status IS 'Status da assinatura (active, canceled, past_due, etc)';
COMMENT ON COLUMN empresas.subscription_current_period_end IS 'Data de término do período atual da assinatura';
COMMENT ON COLUMN empresas.mercadopago_customer_id IS 'ID do cliente no Mercado Pago';
COMMENT ON COLUMN empresas.mercadopago_subscription_id IS 'ID da assinatura no Mercado Pago';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_empresas_stripe_customer ON empresas(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_empresas_stripe_subscription ON empresas(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_empresas_subscription_status ON empresas(subscription_status);
