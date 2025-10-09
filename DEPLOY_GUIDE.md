# 🚀 GUIA DE DEPLOY - Vendr para Produção

**Status:** ✅ Código commitado e enviado para repositório  
**Branch:** main  
**Commit:** feat: UI/UX global update - TopBar azul, upload avatars, página configurações

---

## 📋 PRÉ-REQUISITOS

Antes de fazer deploy, você precisa ter:

- ✅ Conta na Vercel (https://vercel.com)
- ✅ Projeto Supabase de produção configurado
- ✅ Variáveis de ambiente prontas
- ✅ Build local passou sem erros (já verificado ✅)

---

## 🎯 OPÇÃO 1: Deploy na Vercel (RECOMENDADO)

### Passo 1: Conectar Repositório à Vercel

**1.1 Acessar Vercel Dashboard**
```
https://vercel.com/dashboard
```

**1.2 Importar Projeto**
```
1. Clicar em "Add New..." → "Project"
2. Selecionar o repositório do Vendr
3. Clicar em "Import"
```

**1.3 Configurar Build**
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node Version: 18.x ou superior
```

### Passo 2: Configurar Variáveis de Ambiente

**No painel da Vercel, adicionar as seguintes variáveis:**

```env
# Supabase (PRODUÇÃO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...sua-chave-anon

# WhatsApp (Opcional)
NEXT_PUBLIC_WHATSAPP_NUMBER=5513981401945

# Stripe (Opcional - para billing real)
STRIPE_SECRET_KEY=sk_live_...sua-chave-stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics (Opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

**⚠️ IMPORTANTE:**
- Use as chaves de **PRODUÇÃO** do Supabase (não as de dev)
- Mantenha `SUPABASE_ANON_KEY` como variável de ambiente secreta

### Passo 3: Deploy

```
1. Clicar em "Deploy"
2. Aguardar build (~2-3 minutos)
3. ✅ Deploy concluído!
```

**URL gerada:** `https://vendr-seu-projeto.vercel.app`

---

## 🗄️ PASSO CRÍTICO: Executar Migrações SQL em Produção

**⚠️ OBRIGATÓRIO** - Sem isso, o upload de avatares e configurações não funcionarão!

### 1. Acessar Supabase de Produção

```
1. Ir para: https://supabase.com/dashboard
2. Selecionar o projeto de PRODUÇÃO
3. Clicar em "SQL Editor" no menu lateral
```

### 2. Executar Migrações na Ordem

**Migração 1: Avatars e Configurações**
```sql
-- Copiar TODO o conteúdo de:
-- supabase-avatars-config-migration.sql

-- Colar no SQL Editor e clicar em "Run"
```

**Resultado esperado:**
```
✅ Success. No rows returned
-- Ou mensagens de CREATE TABLE, ALTER TABLE
```

**Migração 2: Storage Setup**
```sql
-- Copiar TODO o conteúdo de:
-- supabase-storage-setup.sql

-- Colar no SQL Editor e clicar em "Run"
```

**Resultado esperado:**
```
✅ Bucket 'avatars' criado
✅ 4 políticas RLS criadas
✅ Triggers configurados
```

### 3. Verificar Storage

**No Supabase Dashboard:**
```
Storage → Buckets → Verificar bucket "avatars" existe
Storage → Policies → Verificar 4 políticas ativas
```

---

## ✅ VALIDAÇÃO DO DEPLOY

Após deploy completo, testar:

### 1. Acessar a URL de produção
```
https://vendr-seu-projeto.vercel.app
```

### 2. Testar TopBar Azul
```
- Acessar /dashboard
- Verificar TopBar azul #0057FF
- Verificar logo branca
- Verificar sem botão laranja "Suporte"
```

### 3. Testar Página de Configurações
```
- Acessar /configuracoes
- Verificar 7 tabs carregam
- Todas tabs renderizam sem erro
```

### 4. Testar Upload de Avatar
```
- Ir em /configuracoes → Tab "Perfil da Empresa"
- Fazer upload de imagem (< 2MB)
- Verificar preview aparece
- Verificar avatar atualiza no TopBar
```

### 5. Verificar Console do Navegador
```
- F12 → Console
- Não deve ter erros vermelhos
- Avisos amarelos são aceitáveis
```

---

## 🔒 CONFIGURAÇÕES DE SEGURANÇA (Opcional)

### Domínio Customizado

**Na Vercel:**
```
Settings → Domains → Add Domain
Ex: app.vendr.com.br
```

### SSL/TLS
```
✅ Automático pela Vercel
Certificado Let's Encrypt gerenciado
```

### Headers de Segurança

Criar arquivo `vercel.json` na raiz:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🎯 OPÇÃO 2: Deploy Manual (Alternativa)

Se não quiser usar Vercel:

### 1. Build Local
```bash
npm run build
```

### 2. Exportar Estático (se aplicável)
```bash
npm run export
```

### 3. Subir para Servidor
```bash
# Via FTP, SSH, ou plataforma de hospedagem
# Ex: Netlify, Railway, DigitalOcean
```

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Vercel Analytics
```
Dashboard → Analytics
Monitorar:
- Page Views
- Unique Visitors
- Performance (Web Vitals)
```

### Supabase Monitoring
```
Dashboard → Logs
Monitorar:
- API Requests
- Storage Usage
- Database Queries
```

### Error Tracking (Recomendado)

Integrar Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Module not found" no build
**Solução:**
```bash
# Local
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push

# Vercel fará rebuild automático
```

### Erro: Upload de avatar não funciona
**Causa:** Migrações SQL não executadas  
**Solução:** Executar `supabase-storage-setup.sql` no Supabase de produção

### Erro: 500 Internal Server Error
**Causa:** Variáveis de ambiente faltando  
**Solução:** Verificar todas as env vars na Vercel:
```
Settings → Environment Variables
```

### Erro: TopBar não aparece azul
**Causa:** Cache do browser  
**Solução:** Hard reload (Ctrl + Shift + R)

---

## 🔄 PROCESSO DE ATUALIZAÇÃO (Futuros Deploys)

Para próximas atualizações:

```bash
# 1. Fazer alterações no código
# 2. Commit
git add .
git commit -m "feat: nova feature"

# 3. Push
git push origin main

# 4. Vercel faz deploy automático! ✅
```

**Deploy automático ativado por padrão na Vercel**

---

## 📝 CHECKLIST FINAL DE DEPLOY

Marque conforme for fazendo:

**Pré-Deploy:**
- [x] Código commitado
- [x] Build local passou
- [ ] Variáveis de ambiente prontas
- [ ] Supabase de produção configurado

**Deploy:**
- [ ] Repositório conectado à Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy executado com sucesso
- [ ] URL de produção gerada

**Migrações:**
- [ ] `supabase-avatars-config-migration.sql` executada
- [ ] `supabase-storage-setup.sql` executada
- [ ] Bucket 'avatars' verificado
- [ ] Políticas RLS ativas

**Validação:**
- [ ] TopBar azul em todas as páginas
- [ ] Página /configuracoes acessível
- [ ] Upload de avatar funciona
- [ ] Console sem erros críticos
- [ ] Navegação funcionando

**Pós-Deploy:**
- [ ] Domínio customizado (opcional)
- [ ] Analytics configurado (opcional)
- [ ] Error tracking (opcional)

---

## 🎉 DEPLOY CONCLUÍDO!

Quando todos os checkboxes estiverem marcados:
✅ **Vendr está em produção!**

**Próximos passos:**
1. Compartilhar URL com time/clientes
2. Monitorar logs e analytics
3. Coletar feedback de usuários
4. Iterar e melhorar

---

## 📞 SUPORTE

**Documentação criada:**
- `DEPLOY_GUIDE.md` ← Este arquivo
- `FINAL_REPORT.md` ← Resumo da implementação
- `FEATURE_UI_AVATARS_CONFIG.md` ← Detalhes técnicos
- `GUIA_TESTES_PRATICOS.md` ← Testes manuais

**Links úteis:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Deploy: https://nextjs.org/docs/deployment

---

**Criado em:** 2025-10-09  
**Autor:** Windsurf AI + Lucas  
**Versão:** 1.0.0
