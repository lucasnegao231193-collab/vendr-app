# 🚢 Guia de Deploy - Vendr

## Opção 1: Vercel (Recomendado)

### Pré-requisitos
- Conta no GitHub
- Conta no Vercel
- Projeto Supabase configurado

### Passo a Passo

#### 1. Preparar Repositório

```bash
# Inicializar git (se ainda não foi)
git init

# Adicionar arquivos
git add .
git commit -m "feat: Vendr MVP completo"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/vendr.git
git branch -M main
git push -u origin main
```

#### 2. Deploy na Vercel

1. Acesse https://vercel.com
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

5. **Environment Variables** (clique em "Add"):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
NEXT_PUBLIC_VENDR_PIX_KEY=sua-chave-pix
NEXT_PUBLIC_TZ=America/Sao_Paulo
```

6. Clique em "Deploy"

#### 3. Configurar Supabase

Após deploy bem-sucedido:

1. Copie a URL da Vercel (ex: `https://vendr.vercel.app`)
2. Vá em Supabase → Authentication → URL Configuration
3. Em **Site URL**, coloque: `https://vendr.vercel.app`
4. Em **Redirect URLs**, adicione:
   - `https://vendr.vercel.app/**`
   - `http://localhost:3000/**` (para desenvolvimento)

#### 4. Testar

Acesse sua URL da Vercel e teste:
- ✅ Login/Cadastro
- ✅ Criação de empresa
- ✅ CRUD de produtos/vendedores
- ✅ Registro de vendas
- ✅ Realtime no dashboard
- ✅ PWA instalável

---

## Opção 2: Netlify

### Deploy

1. Acesse https://netlify.com
2. "Add new site" → "Import from Git"
3. Conecte GitHub e selecione repositório
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: `netlify/functions` (se usar)

5. **Environment Variables**: mesmo que Vercel

6. Deploy!

### Configuração Adicional

Crie `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Opção 3: AWS (Amplify)

### Deploy

1. Acesse AWS Console → Amplify
2. "New app" → "Host web app"
3. Conecte GitHub
4. Configure build settings
5. Adicione Environment Variables
6. Deploy

---

## Opção 4: Self-Hosted (Docker)

### Dockerfile

Crie `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  vendr:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_VENDR_PIX_KEY=${NEXT_PUBLIC_VENDR_PIX_KEY}
      - NEXT_PUBLIC_TZ=America/Sao_Paulo
    restart: unless-stopped
```

### Deploy

```bash
docker-compose up -d
```

---

## 📱 Configurar Domínio Customizado

### Na Vercel

1. Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

### DNS Records

```
Type: A
Name: @
Value: 76.76.21.21 (IP da Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL/HTTPS

✅ Automático na Vercel/Netlify (Let's Encrypt)

---

## 🔒 Checklist de Segurança

Antes de ir para produção:

- [ ] Todas as env vars configuradas
- [ ] RLS habilitado em todas as tabelas
- [ ] Supabase URL Configuration atualizada
- [ ] HTTPS habilitado
- [ ] Chaves PIX reais configuradas
- [ ] Backup database configurado
- [ ] Monitoring configurado (Vercel Analytics, Sentry)
- [ ] Rate limiting configurado (se necessário)
- [ ] Domínio customizado configurado
- [ ] Email de recuperação de senha configurado

---

## 📊 Monitoring

### Vercel Analytics

Já incluído automaticamente. Acesse em:
- Vercel Dashboard → seu-projeto → Analytics

### Sentry (Erros)

1. Crie conta em sentry.io
2. Instale SDK:
   ```bash
   npm install @sentry/nextjs
   ```
3. Configure `sentry.client.config.js`

### Uptime Monitoring

Use serviços como:
- UptimeRobot (grátis)
- Pingdom
- StatusCake

---

## 🔄 Atualizações

### Continuous Deployment

Vercel/Netlify fazem deploy automático ao fazer push:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Deploy automático inicia!
```

### Deploy Manual

```bash
# Vercel CLI
npm i -g vercel
vercel --prod

# Netlify CLI
npm i -g netlify-cli
netlify deploy --prod
```

---

## 🐛 Troubleshooting

### Build falha na Vercel

**Erro**: "Module not found"
✅ Confirme que todas as dependências estão em `package.json`

**Erro**: "Environment variable missing"
✅ Verifique Environment Variables na Vercel

### PWA não funciona

**Problema**: Service Worker não registra
✅ Confirme que está usando HTTPS (não HTTP)

### Realtime não funciona

**Problema**: Subscriptions falham
✅ Verifique RLS - policies podem bloquear realtime
✅ Confirme Supabase Replication está ativa

### Login redireciona errado

**Problema**: Vai para localhost após login
✅ Atualize Site URL no Supabase
✅ Adicione todas as URLs em Redirect URLs

---

## 📈 Escalabilidade

### Supabase

- ✅ Free tier: 500MB database, 2GB bandwidth
- Upgrade conforme necessário
- Configure backups automáticos

### Vercel

- ✅ Hobby tier: Unlimited bandwidth
- Pro: $20/mês para times
- Enterprise: custom

### CDN

- ✅ Automático na Vercel/Netlify
- Assets servidos globalmente

---

## 💰 Custos Estimados

### Startup (até 1000 usuários)

- Vercel Hobby: **GRÁTIS**
- Supabase Free: **GRÁTIS**
- Domínio: ~R$ 40/ano
- **Total**: R$ 40/ano

### Crescimento (1000-10000 usuários)

- Vercel Pro: $20/mês = R$ 100/mês
- Supabase Pro: $25/mês = R$ 125/mês
- Domínio: R$ 40/ano
- **Total**: ~R$ 2.700/ano

---

Pronto para produção! 🚀
