# 🔔 Guia de Notificações - Venlo

## Visão Geral

O Venlo possui um sistema completo de notificações com 3 canais:
- **In-App**: Notificações dentro da plataforma
- **Email**: Notificações por email (SMTP)
- **Push**: Notificações push no navegador/PWA

## 📋 Tipos de Notificações

### Automáticas
- ✅ Nova venda realizada
- ⚠️ Estoque baixo
- 🎯 Meta atingida
- 💳 Pagamento processado
- 📦 Nova transferência recebida

### Manuais
- 📢 Avisos da empresa
- 🎉 Promoções
- 📊 Relatórios periódicos

## 🔧 Configuração

### 1. Email (SMTP)

Configure as variáveis de ambiente:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@venlo.com.br
```

#### Gmail
1. Ative a verificação em 2 etapas
2. Gere uma senha de app em: https://myaccount.google.com/apppasswords
3. Use a senha gerada no `SMTP_PASS`

### 2. Push Notifications

Gere as VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Adicione as keys no `.env`:

```env
VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=contato@venlo.com.br
```

### 3. Banco de Dados

Execute a migration:

```sql
-- Já incluída em: supabase/migrations/20251016_notifications.sql
```

## 🚀 Como Usar

### Enviar Notificação

```typescript
// API Route
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    type: 'success',
    title: 'Nova Venda!',
    message: 'João realizou uma venda de R$ 150,00',
    channels: ['in-app', 'email', 'push'],
    data: {
      url: '/dashboard',
    },
  }),
});
```

### Registrar Push Subscription

```typescript
// No cliente
if ('serviceWorker' in navigator && 'PushManager' in window) {
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'VAPID_PUBLIC_KEY',
  });

  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });
}
```

### Centro de Notificações

```tsx
import { NotificationCenter } from '@/components/NotificationCenter';

// No layout ou header
<NotificationCenter />
```

## 📧 Templates de Email

### Disponíveis

- `welcomeEmail(name)`: Email de boas-vindas
- `newSaleEmail(sellerName, total, products)`: Nova venda
- `subscriptionEmail(planName, amount, status)`: Pagamento
- `lowStockEmail(productName, currentStock)`: Estoque baixo

### Criar Novo Template

```typescript
// lib/notifications/email.ts
export function meuTemplate(params) {
  return {
    subject: 'Assunto',
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Título</h1>
          <p>Conteúdo</p>
        </body>
      </html>
    `,
  };
}
```

## 🔔 Templates de Push

### Disponíveis

- `newSalePush(sellerName, total)`: Nova venda
- `lowStockPush(productName, quantity)`: Estoque baixo
- `goalAchievedPush(sellerName, goalType)`: Meta atingida
- `paymentSuccessPush(planName, amount)`: Pagamento sucesso
- `paymentFailedPush(planName)`: Pagamento falhou
- `newTransferPush(productName, quantity)`: Nova transferência

### Criar Novo Template

```typescript
// lib/notifications/push.ts
export function meuPush(params) {
  return {
    title: 'Título',
    body: 'Mensagem',
    icon: '/icon-192x192.png',
    data: {
      type: 'meu_tipo',
      url: '/minha-rota',
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes',
      },
    ],
  };
}
```

## 📊 Banco de Dados

### Tabela `notifications`

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
title TEXT
message TEXT
type TEXT (info, success, warning, error)
read BOOLEAN
action_url TEXT
created_at TIMESTAMPTZ
```

### Tabela `push_subscriptions`

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
subscription JSONB
active BOOLEAN
created_at TIMESTAMPTZ
```

## 🧪 Testes

### Testar Email

```bash
# Usar Mailtrap para desenvolvimento
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu-usuario
SMTP_PASS=sua-senha
```

### Testar Push

1. Abra o DevTools (F12)
2. Vá em Application > Service Workers
3. Registre o service worker
4. Vá em Application > Push Messaging
5. Envie uma notificação de teste

## 🔒 Segurança

- ✅ RLS habilitado nas tabelas
- ✅ Usuários só veem suas próprias notificações
- ✅ VAPID keys protegidas
- ✅ SMTP credentials protegidas
- ✅ Validação de permissões

## 📚 Recursos

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Nodemailer](https://nodemailer.com/)
- [VAPID](https://tools.ietf.org/html/rfc8292)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
