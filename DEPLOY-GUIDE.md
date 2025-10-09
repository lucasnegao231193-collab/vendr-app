# 🚀 Guia de Deploy - Vendr

## 📋 Checklist Pré-Deploy

- [ ] Migração SQL aplicada no Supabase (tabelas criadas)
- [ ] Aplicação funcionando localmente (`npm run dev`)
- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Build local funcionando (`npm run build`)
- [ ] Git configurado e código commitado

---

## 🎯 Opção 1: Vercel (Recomendado - Mais Fácil)

### Por que Vercel?
✅ **Gratuito** para projetos pessoais  
✅ **Deploy automático** a cada push no Git  
✅ **Otimizado** para Next.js  
✅ **SSL grátis** (HTTPS)  
✅ **CDN global**  
✅ **Fácil configuração** de variáveis de ambiente

### Passo a Passo

#### 1️⃣ **Prepare o Repositório Git**

```bash
# No terminal (dentro do projeto):

# Se ainda não inicializou o Git:
git init

# Adicione todos os arquivos:
git add .

# Faça o primeiro commit:
git commit -m "🚀 Vendr v2 - Pronto para deploy"

# Crie repositório no GitHub:
# - Vá em https://github.com/new
# - Nome: vendr-app (ou outro nome)
# - Deixe público ou privado
# - NÃO inicialize com README

# Conecte ao GitHub:
git remote add origin https://github.com/SEU-USUARIO/vendr-app.git
git branch -M main
git push -u origin main
```

---

#### 2️⃣ **Faça Deploy na Vercel**

1. **Acesse**: https://vercel.com
2. **Faça login** com GitHub
3. **Clique em "Add New Project"**
4. **Importe** seu repositório `vendr-app`
5. **Configure as variáveis de ambiente**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
NEXT_PUBLIC_VENDR_PIX_KEY=sua-chave-pix@email.com
NEXT_PUBLIC_TZ=America/Sao_Paulo
NEXT_PUBLIC_APP_NAME=Vendr
NEXT_PUBLIC_SUPPORT_WHATSAPP=+5511999999999
NEXT_PUBLIC_SUPPORT_MESSAGE_OWNER=Olá! Sou empresa e preciso de ajuda no Vendr.
NEXT_PUBLIC_SUPPORT_MESSAGE_SELLER=Olá! Sou vendedor e preciso de ajuda no Vendr.
```

6. **Clique em "Deploy"**
7. **Aguarde 2-3 minutos**
8. **Pronto!** Sua URL será algo como: `vendr-app.vercel.app`

---

#### 3️⃣ **Configurar Domínio Personalizado (Opcional)**

1. Na Vercel, vá em **Settings → Domains**
2. Adicione seu domínio (ex: `vendr.com.br`)
3. Configure DNS conforme instruções da Vercel
4. Aguarde propagação (até 48h)

---

## 🎯 Opção 2: Netlify (Alternativa)

### Passo a Passo

1. **Acesse**: https://netlify.com
2. **Login** com GitHub
3. **"Add new site" → "Import an existing project"**
4. Escolha seu repositório
5. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. **Environment variables**: Cole as mesmas variáveis acima
7. **Deploy**

---

## 🎯 Opção 3: Railway (Backend + Frontend)

### Passo a Passo

1. **Acesse**: https://railway.app
2. **Login** com GitHub
3. **"New Project" → "Deploy from GitHub repo"**
4. Escolha seu repositório
5. Railway detecta Next.js automaticamente
6. **Variables**: Adicione as variáveis de ambiente
7. **Deploy**

---

## ⚙️ Build Local (Teste Antes de Deploy)

Antes de fazer deploy, teste o build local:

```bash
# Instale dependências
npm install

# Faça build de produção
npm run build

# Teste build de produção localmente
npm start
```

Se aparecer erros, corrija antes de fazer deploy!

---

## 🔒 Configurar Supabase para Produção

### 1️⃣ **Adicionar URL de Produção**

1. Acesse Supabase Dashboard
2. Vá em **Authentication → URL Configuration**
3. Adicione em **Site URL**: `https://sua-app.vercel.app`
4. Adicione em **Redirect URLs**:
   - `https://sua-app.vercel.app/**`
   - `https://sua-app.vercel.app/auth/callback`

### 2️⃣ **CORS (se necessário)**

Em **Settings → API**:
- Adicione sua URL na lista de origens permitidas

---

## 📱 PWA (App Instalável) - Opcional

Se quiser que seja instalável no celular:

1. Crie ícones PWA (192x192 e 512x512)
2. Coloque em `/public/icon-192.png` e `/public/icon-512.png`
3. Atualize `/public/manifest.json` com os ícones
4. Após deploy, usuários poderão "Adicionar à tela inicial"

---

## 🚨 Troubleshooting

### Erro: "Module not found"
```bash
# Limpe cache e reinstale
rm -rf node_modules .next
npm install
npm run build
```

### Erro: "Environment variables not found"
- Certifique-se de adicionar TODAS as variáveis na Vercel/Netlify
- Use exatamente os mesmos nomes

### Build demora muito
- Normal na primeira vez (5-10 minutos)
- Builds subsequentes são mais rápidos (1-2 minutos)

### Site não carrega
- Verifique logs na Vercel (Functions → View Logs)
- Verifique se Supabase URL está correta
- Verifique se RLS está configurado

---

## 📊 Depois do Deploy

### Monitoramento (Gratuito)

- **Vercel Analytics**: Veja tráfego e performance
- **Sentry**: Rastreie erros em produção
- **LogRocket**: Grave sessões de usuários

### Updates Futuros

Sempre que fizer alterações:
```bash
git add .
git commit -m "Descrição da alteração"
git push
```

A Vercel faz deploy automático! 🚀

---

## 🎯 URLs de Exemplo

Após deploy, você terá:
- **Frontend**: `https://vendr-app.vercel.app`
- **Dashboard**: `https://vendr-app.vercel.app/dashboard`
- **Login**: `https://vendr-app.vercel.app/login`
- **Vendedor**: `https://vendr-app.vercel.app/vendedor`

---

## ✅ Checklist Final

- [ ] Deploy feito com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase URL de produção adicionada
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Estoque acessível
- [ ] WhatsApp funcionando
- [ ] SSL (HTTPS) ativo
- [ ] Domínio personalizado (se aplicável)

---

**Pronto para deixar o Vendr online!** 🚀✨

---

## 💡 Dicas Extras

### Custom Domain (Domínio Próprio)

Se quiser `vendr.com.br` ao invés de `vendr-app.vercel.app`:
1. Compre domínio (Registro.br, GoDaddy, Namecheap)
2. Configure na Vercel (Settings → Domains)
3. Atualize DNS do domínio conforme instruções

### Analytics

Adicione Google Analytics ou Vercel Analytics:
- Vercel Analytics: Já vem grátis!
- Google Analytics: Adicione tag em `app/layout.tsx`

### SEO

Já configurado em `app/layout.tsx`:
- Title, description
- Open Graph tags
- Manifest.json para PWA

---

**Bora deixar o Vendr no ar!** 🎉
