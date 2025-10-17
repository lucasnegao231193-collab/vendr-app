# 📚 Documentação Completa - Venlo

**Sistema de Gestão de Vendas Externas/Ambulantes**  
**Versão:** 1.0.0  
**Última Atualização:** 17/10/2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [PWA - Progressive Web App](#pwa---progressive-web-app)
5. [Monitoramento](#monitoramento)
6. [Deploy](#deploy)
7. [Estrutura do Projeto](#estrutura-do-projeto)

---

## 🎯 Visão Geral

Venlo é um SaaS completo para gestão de vendas ambulantes e externas, focado em distribuidoras, bebidas, alimentos e cosméticos.

### Funcionalidades Principais:
- ✅ Dashboard Analytics
- ✅ Gestão de Vendedores
- ✅ Controle de Estoque (Central + Individual)
- ✅ Sistema de Transferências
- ✅ Sistema de Devoluções
- ✅ Registro de Vendas (Online/Offline)
- ✅ Gestão Financeira
- ✅ Relatórios e Exportação
- ✅ PWA (Funciona Offline)
- ✅ Modo Solo (Autônomos)

---

## 🏗️ Stack Tecnológico

### Frontend:
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **Framer Motion**

### Backend:
- **Supabase** (Auth, Database, Realtime)
- **Next.js API Routes**
- **PostgreSQL**

### PWA/Offline:
- **next-pwa**
- **IndexedDB (idb)**
- **Service Workers**

### Monitoramento:
- **Sentry** (Errors & Performance)
- **Vercel Analytics** (opcional)
- **Google Analytics** (opcional)

---

## ⚙️ Configuração do Ambiente

### 1. Variáveis de Ambiente (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sentry (Monitoramento)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token

# Pagamentos (Opcional)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
MERCADOPAGO_ACCESS_TOKEN=your_mp_token

# Analytics (Opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

---

## 📱 PWA - Progressive Web App

### Configuração Ativa:
- ✅ Service Worker automático (next-pwa)
- ✅ Manifest.json configurado
- ✅ Ícones 192x192 e 512x512
- ✅ Cache strategies otimizadas
- ✅ Botão de instalação na TopBar
- ✅ Banner de instalação automático

### Como Instalar:

#### Desktop (Chrome/Edge):
1. Clique no botão de download (⬇️) na TopBar
2. OU clique no ícone na barra de endereço
3. Confirme a instalação

#### Mobile (Android):
1. Clique no botão de download na TopBar
2. OU Menu → "Adicionar à tela inicial"
3. Confirme a instalação

#### iOS (Safari):
1. Botão Compartilhar (□↑)
2. "Adicionar à Tela de Início"
3. Confirme

### Cache Strategies:
- **Supabase API:** NetworkFirst (10s timeout)
- **Imagens:** CacheFirst (30 dias)
- **JS/CSS:** StaleWhileRevalidate (24h)

---

## 📊 Monitoramento

### Sentry (Ativo)

**Configurado para:**
- ✅ Rastreamento de erros
- ✅ Performance monitoring
- ✅ Session replay
- ✅ Breadcrumbs
- ✅ Source maps

**Ambientes:**
- Produção: Todos os erros
- Desenvolvimento: Desabilitado

**Como usar:**
```typescript
import * as Sentry from "@sentry/nextjs";

// Capturar erro manualmente
try {
  // código
} catch (error) {
  Sentry.captureException(error);
}

// Adicionar contexto
Sentry.setUser({
  id: userId,
  email: userEmail,
});

// Adicionar tags
Sentry.setTag("feature", "vendas");
```

### Métricas Importantes:
- Taxa de erro
- Performance (LCP, FID, CLS)
- Sessões de usuário
- Erros por página
- Tempo de resposta da API

---

## 🚀 Deploy

### Netlify (Produção Atual)

**URL:** https://venlo.com.br

**Configuração:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Deploy Automático:**
- Push para `main` → Deploy automático
- Pull Request → Preview deploy

**Variáveis de Ambiente:**
- Configuradas no painel do Netlify
- Não commitar no repositório

### Como Fazer Deploy Manual:

```bash
# Via Git
git add .
git commit -m "feat: sua mensagem"
git push origin main

# Via Netlify CLI
netlify deploy --prod
```

---

## 📁 Estrutura do Projeto

```
venlo/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   ├── dashboard/            # Dashboard Admin
│   ├── vendedor/             # Área do Vendedor
│   ├── solo/                 # Modo Autônomo
│   ├── landing-page/         # Landing Page
│   └── layout.tsx            # Layout Principal
│
├── components/               # Componentes React
│   ├── ui/                   # Componentes UI (Shadcn)
│   ├── layout/               # Layouts (TopBar, Sidebar, etc)
│   ├── InstallPWA.tsx        # Banner PWA
│   └── InstallPWAButton.tsx  # Botão PWA TopBar
│
├── lib/                      # Utilitários
│   ├── supabase-browser.ts   # Cliente Supabase
│   ├── supabase-server.ts    # Servidor Supabase
│   └── utils.ts              # Funções auxiliares
│
├── public/                   # Assets estáticos
│   ├── icon-192.png          # Ícone PWA 192x192
│   ├── icon-512.png          # Ícone PWA 512x512
│   ├── manifest.json         # PWA Manifest
│   ├── logo-vendr.png        # Logo principal
│   └── vendr-white-v3.png    # Logo branco
│
├── supabase/                 # Migrations Supabase
│   └── migrations/           # SQL migrations
│
├── types/                    # TypeScript types
│
├── .env.local                # Variáveis de ambiente (não commitar)
├── next.config.js            # Configuração Next.js + PWA
├── tailwind.config.ts        # Configuração Tailwind
└── package.json              # Dependências
```

---

## 🎨 Design System - Trust Blue

### Cores Principais:
```css
--trust-blue-50: #F8FAFC
--trust-blue-100: #F1F5F9
--trust-blue-200: #E2E8F0
--trust-blue-500: #415A77
--trust-blue-700: #1B263B
--trust-blue-900: #0D1B2A

--venlo-orange-500: #FF6600
--venlo-orange-600: #CC5200
```

### Componentes UI:
- Baseados em Shadcn UI
- Customizados com Trust Blue
- Totalmente acessíveis (ARIA)
- Responsivos (mobile-first)

---

## 🗄️ Banco de Dados

### Tabelas Principais:

- **perfis** - Usuários do sistema
- **empresas** - Empresas cadastradas
- **produtos** - Catálogo de produtos
- **estoques** - Estoque central
- **vendedor_estoque** - Estoque individual
- **transferencias** - Transferências de estoque
- **devolucoes** - Devoluções de produtos
- **vendas** - Registro de vendas
- **vendas_servicos** - Vendas de serviços (solo)
- **servicos_catalogo** - Catálogo de serviços (solo)
- **estoque_logs** - Logs de movimentação

### Políticas RLS:
- Todas as tabelas protegidas
- Acesso baseado em empresa_id
- Validação de permissões por tipo de usuário

---

## 🧪 Testes

### Executar Testes:
```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Estrutura de Testes:
```
__tests__/
├── components/
├── lib/
└── pages/
```

---

## 📝 Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento

# Build
npm run build            # Build de produção
npm start                # Iniciar produção

# Qualidade de Código
npm run lint             # ESLint
npm run format           # Prettier

# Testes
npm test                 # Jest
npm run test:coverage    # Coverage report

# Validação
npm run validate:env     # Validar .env
npm run verify:site      # Verificar site
```

---

## 🔒 Segurança

### Boas Práticas:
- ✅ Variáveis sensíveis em .env
- ✅ RLS ativo no Supabase
- ✅ HTTPS obrigatório
- ✅ Validação de inputs (Zod)
- ✅ Sanitização de dados
- ✅ Rate limiting (planejado)

### Não Commitar:
- `.env.local`
- Chaves de API
- Tokens de acesso
- Dados sensíveis

---

## 🐛 Troubleshooting

### Build Falha:
1. Verificar variáveis de ambiente
2. Limpar cache: `rm -rf .next`
3. Reinstalar: `rm -rf node_modules && npm install`

### PWA Não Instala:
1. Verificar HTTPS (produção)
2. Limpar cache do navegador
3. Verificar manifest.json
4. Verificar Service Worker no DevTools

### Erro de Autenticação:
1. Verificar Supabase URL e Keys
2. Verificar políticas RLS
3. Verificar sessão do usuário

---

## 📞 Suporte

**Repositório:** https://github.com/lucasnegao231193-collab/vendr-app  
**Site:** https://venlo.com.br  
**Desenvolvedor:** Lucas Vinicius

---

**Última Atualização:** 17/10/2025  
**Versão:** 1.0.0
