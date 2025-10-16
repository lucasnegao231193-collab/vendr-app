# 📈 Guia de Monitoramento - Venlo

## Visão Geral

O Venlo possui um sistema completo de monitoramento com:
- **Sentry**: Rastreamento de erros e performance
- **Analytics Customizado**: Métricas de uso
- **Vercel Analytics**: Métricas de web vitals (opcional)
- **Google Analytics**: Análise de comportamento (opcional)

## 🔧 Configuração

### 1. Sentry

1. Crie uma conta em [sentry.io](https://sentry.io)
2. Crie um novo projeto Next.js
3. Copie o DSN fornecido
4. Adicione no `.env`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=... # Para uploads de source maps
```

5. Configure source maps (opcional):

```bash
# No package.json, adicione:
"build": "next build && sentry-cli sourcemaps upload --org=sua-org --project=seu-projeto .next"
```

### 2. Google Analytics (Opcional)

1. Crie uma propriedade em [analytics.google.com](https://analytics.google.com)
2. Copie o ID de medição (G-XXXXXXXXXX)
3. Adicione no `.env`:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. Adicione o script no `app/layout.tsx`:

```tsx
{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
      `}
    </Script>
  </>
)}
```

### 3. Vercel Analytics (Opcional)

Se estiver usando Vercel:

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🚀 Como Usar

### Rastrear Eventos

```typescript
import { Analytics } from '@/lib/analytics/tracker';

// Vendas
Analytics.saleCreated(150.00, 3);
Analytics.saleCompleted(150.00, 'pix');

// Produtos
Analytics.productAdded('Produto X');
Analytics.productViewed('produto-123');

// Usuários
Analytics.userSignedUp('email');
Analytics.userLoggedIn('google');

// Assinaturas
Analytics.subscriptionStarted('empresa_pro', 249.90);
Analytics.subscriptionCanceled('empresa_pro', 'muito caro');

// Relatórios
Analytics.reportGenerated('sales', 'pdf');
Analytics.reportExported('stock', 'csv');

// Performance
Analytics.pageLoadTime('/dashboard', 1250);
Analytics.apiResponseTime('/api/vendas', 350);
```

### Rastrear Erros

```typescript
import { trackError } from '@/lib/analytics/tracker';

try {
  // código que pode falhar
} catch (error) {
  trackError(error as Error, {
    context: 'payment_processing',
    userId: user.id,
  });
}
```

### Configurar Contexto do Usuário

```typescript
import { setUserContext, clearUserContext } from '@/lib/analytics/tracker';

// No login
setUserContext({
  id: user.id,
  email: user.email,
  name: user.name,
  role: 'owner',
  companyId: empresa.id,
});

// No logout
clearUserContext();
```

### Rastrear Página

```typescript
import { trackPageView } from '@/lib/analytics/tracker';

// Em componentes de página
useEffect(() => {
  trackPageView(window.location.pathname);
}, []);
```

## 📊 Dashboard de Analytics

Acesse `/analytics` para ver:
- Total de eventos rastreados
- Conversões realizadas
- Erros capturados
- Performance média
- Eventos recentes
- Distribuição por categoria

## 🔍 Sentry Features

### Capturadas Automaticamente

- ✅ Erros de JavaScript
- ✅ Erros de API
- ✅ Erros não capturados
- ✅ Promise rejections
- ✅ Console errors

### Session Replay

Sentry captura replays de sessões onde ocorreram erros, permitindo:
- Ver exatamente o que o usuário fez
- Reproduzir o erro
- Identificar a causa raiz

### Performance Monitoring

- Tempo de carregamento de páginas
- Tempo de resposta de APIs
- Web Vitals (LCP, FID, CLS)
- Transações customizadas

### Breadcrumbs

Sentry captura automaticamente:
- Cliques do usuário
- Navegação entre páginas
- Requisições HTTP
- Logs do console
- Eventos customizados

## 📈 Métricas Importantes

### Conversões

- Vendas criadas
- Vendas completadas
- Usuários cadastrados
- Assinaturas iniciadas

### Engajamento

- Páginas visualizadas
- Tempo na plataforma
- Produtos visualizados
- Relatórios gerados

### Performance

- Tempo de carregamento
- Tempo de resposta de API
- Taxa de erro
- Uptime

## 🔒 Privacidade

### Dados Sensíveis

O sistema automaticamente:
- ✅ Remove headers de autorização
- ✅ Remove cookies
- ✅ Mascara campos de senha
- ✅ Mascara números de cartão
- ✅ Ignora extensões do navegador

### LGPD/GDPR

- Dados são anonimizados quando possível
- Usuários podem solicitar exclusão de dados
- Logs são retidos por 90 dias (configurável)

## 🐛 Debugging

### Ver Eventos Locais

```typescript
import { getLocalEvents } from '@/lib/analytics/tracker';

const events = getLocalEvents();
console.log(events);
```

### Limpar Eventos Locais

```typescript
import { clearLocalEvents } from '@/lib/analytics/tracker';

clearLocalEvents();
```

### Testar Sentry

```typescript
import * as Sentry from '@sentry/nextjs';

// Enviar erro de teste
Sentry.captureException(new Error('Teste de erro'));

// Enviar mensagem de teste
Sentry.captureMessage('Teste de mensagem', 'info');
```

## 📚 Recursos

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Google Analytics](https://developers.google.com/analytics)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Web Vitals](https://web.dev/vitals/)

## 🎯 Melhores Práticas

1. **Rastreie eventos importantes**, não tudo
2. **Use categorias consistentes**
3. **Adicione contexto aos erros**
4. **Monitore performance regularmente**
5. **Configure alertas no Sentry**
6. **Revise métricas semanalmente**
7. **Otimize baseado em dados**
