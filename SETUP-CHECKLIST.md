# ✅ Checklist de Configuração - Venlo

## 📋 Passo 1: Variáveis de Ambiente

### Local (.env.local)

Crie o arquivo `.env.local` na raiz do projeto com:

```env
# ========================================
# SUPABASE (OBRIGATÓRIO)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# SITE URL (OBRIGATÓRIO)
# ========================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ========================================
# STRIPE (Para Pagamentos)
# ========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SOLO_PRO_PRICE_ID=price_...
STRIPE_EMPRESA_STARTER_PRICE_ID=price_...
STRIPE_EMPRESA_PRO_PRICE_ID=price_...
STRIPE_EMPRESA_ENTERPRISE_PRICE_ID=price_...

# ========================================
# MERCADO PAGO (Para Pagamentos Brasil)
# ========================================
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MP_SOLO_PRO_PLAN_ID=plan_...
MP_EMPRESA_STARTER_PLAN_ID=plan_...
MP_EMPRESA_PRO_PLAN_ID=plan_...
MP_EMPRESA_ENTERPRISE_PLAN_ID=plan_...

# ========================================
# EMAIL (Para Notificações)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@venlo.com.br

# ========================================
# PUSH NOTIFICATIONS (Para Notificações)
# ========================================
VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=contato@venlo.com.br

# ========================================
# SENTRY (Para Monitoramento)
# ========================================
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# ========================================
# GOOGLE ANALYTICS (Opcional)
# ========================================
NEXT_PUBLIC_GA_ID=G-...
```

### Produção (Netlify/Vercel)

Configure as mesmas variáveis no painel de configuração:

**Netlify:**
1. Site settings > Environment variables
2. Adicione cada variável

**Vercel:**
1. Project Settings > Environment Variables
2. Adicione cada variável

---

## 📋 Passo 2: Executar Migrations no Supabase

### Como Fazer:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor**
4. Execute cada migration na ordem:

#### Migration 1: Telefone em Empresas
```sql
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS telefone TEXT;

COMMENT ON COLUMN empresas.telefone IS 'Telefone de contato da empresa';
```

#### Migration 2: Corrigir is_solo
```sql
UPDATE empresas 
SET is_solo = false 
WHERE is_solo IS NULL;

ALTER TABLE empresas 
ALTER COLUMN is_solo SET DEFAULT false;

ALTER TABLE empresas 
ALTER COLUMN is_solo SET NOT NULL;
```

#### Migration 3: Campos de Pagamento
```sql
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mercadopago_customer_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_empresas_stripe_customer ON empresas(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_empresas_stripe_subscription ON empresas(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_empresas_subscription_status ON empresas(subscription_status);
```

#### Migration 4: Notificações
```sql
-- Tabela de Notificações In-App
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subscription)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notificações"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver suas próprias subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 📋 Passo 3: Configurar Sentry

### Como Fazer:

1. Acesse: https://sentry.io
2. Crie uma conta (gratuita)
3. Crie um novo projeto:
   - Platform: **Next.js**
   - Nome: **Venlo**
4. Copie o **DSN** fornecido
5. Adicione no `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   ```
6. (Opcional) Gere um Auth Token para source maps:
   - Settings > Auth Tokens
   - Create New Token
   - Adicione no `.env.local`:
     ```env
     SENTRY_AUTH_TOKEN=...
     ```

---

## 📋 Passo 4: Configurar SMTP para Emails

### Opção 1: Gmail (Recomendado para Testes)

1. Ative a verificação em 2 etapas na sua conta Google
2. Acesse: https://myaccount.google.com/apppasswords
3. Gere uma senha de app
4. Adicione no `.env.local`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=senha-de-app-gerada
   SMTP_FROM=noreply@venlo.com.br
   ```

### Opção 2: SendGrid (Recomendado para Produção)

1. Crie conta em: https://sendgrid.com
2. Crie uma API Key
3. Configure:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=sua-api-key
   SMTP_FROM=noreply@venlo.com.br
   ```

### Opção 3: Mailtrap (Para Desenvolvimento)

1. Crie conta em: https://mailtrap.io
2. Copie as credenciais
3. Configure:
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_SECURE=false
   SMTP_USER=seu-usuario
   SMTP_PASS=sua-senha
   SMTP_FROM=noreply@venlo.com.br
   ```

---

## 📋 Passo 5: Gerar VAPID Keys para Push

### Como Fazer:

1. Execute no terminal:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Copie as keys geradas

3. Adicione no `.env.local`:
   ```env
   VAPID_PUBLIC_KEY=BG...
   VAPID_PRIVATE_KEY=...
   VAPID_EMAIL=contato@venlo.com.br
   ```

---

## 📋 Passo 6: Criar Planos no Stripe/Mercado Pago

### Stripe:

1. Acesse: https://dashboard.stripe.com
2. Vá em: **Products**
3. Crie os produtos:

   **Solo Pro:**
   - Nome: Solo Pro
   - Preço: R$ 29,90/mês
   - Copie o Price ID: `price_...`

   **Empresa Starter:**
   - Nome: Empresa Starter
   - Preço: R$ 99,90/mês
   - Copie o Price ID: `price_...`

   **Empresa Pro:**
   - Nome: Empresa Pro
   - Preço: R$ 249,90/mês
   - Copie o Price ID: `price_...`

   **Empresa Enterprise:**
   - Nome: Empresa Enterprise
   - Preço: R$ 599,90/mês
   - Copie o Price ID: `price_...`

4. Configure Webhook:
   - Endpoint: `https://seu-site.com/api/webhooks/stripe`
   - Eventos: Selecione todos de `customer.subscription.*` e `invoice.*`
   - Copie o Webhook Secret: `whsec_...`

5. Adicione no `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_SOLO_PRO_PRICE_ID=price_...
   STRIPE_EMPRESA_STARTER_PRICE_ID=price_...
   STRIPE_EMPRESA_PRO_PRICE_ID=price_...
   STRIPE_EMPRESA_ENTERPRISE_PRICE_ID=price_...
   ```

### Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em: **Suas integrações**
3. Crie uma aplicação
4. Copie o Access Token
5. Adicione no `.env.local`:
   ```env
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
   ```

---

## 📋 Passo 7: Testar Fluxos Completos

### Testes Essenciais:

- [ ] Cadastro de empresa
- [ ] Login com email/senha
- [ ] Cadastro de autônomo
- [ ] Login com Google (autônomo)
- [ ] Criar produto
- [ ] Registrar venda
- [ ] Gerar relatório PDF
- [ ] Receber notificação
- [ ] Assinar plano
- [ ] Cancelar assinatura

---

## 📋 Passo 8: Deploy em Produção

### Netlify:

1. Conecte o repositório GitHub
2. Configure build:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Adicione todas as variáveis de ambiente
4. Deploy!

### Vercel:

1. Importe o projeto do GitHub
2. Configure variáveis de ambiente
3. Deploy automático!

---

## ✅ Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Sentry configurado
- [ ] SMTP configurado
- [ ] VAPID keys geradas
- [ ] Planos criados no Stripe
- [ ] Webhooks configurados
- [ ] Testes realizados
- [ ] Deploy em produção
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Monitoramento ativo

---

## 🎉 Pronto!

Seu sistema está 100% configurado e pronto para uso em produção!
