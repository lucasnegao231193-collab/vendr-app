# 🚀 Deploy via Vercel CLI - Passo a Passo

**Status:** ✅ Vercel CLI instalada (v48.2.9)  
**Pronto para deploy!**

---

## 📋 EXECUTE NO SEU TERMINAL

Abra um novo terminal PowerShell ou cmd e execute:

### Passo 1: Navegar para o projeto
```bash
cd c:\Users\lucas\CascadeProjects\windsurf-project
```

### Passo 2: Executar Deploy
```bash
vercel
```

---

## 💬 PERGUNTAS INTERATIVAS

O Vercel CLI vai fazer várias perguntas. Aqui estão as respostas:

### Pergunta 1: Login
```
? Set up and deploy "~\windsurf-project"? [Y/n]
Resposta: Y (Enter)
```

Se não estiver logado, vai abrir o navegador para autenticação:
```
> No existing credentials found. Please log in:
Resposta: Apertar Enter → Navegador abre → Fazer login
```

### Pergunta 2: Escopo (Conta/Team)
```
? Which scope do you want to deploy to?
Resposta: Selecionar sua conta pessoal (use setas ↑↓)
```

### Pergunta 3: Link com projeto existente
```
? Link to existing project? [y/N]
Resposta: N (se for primeira vez)
```

### Pergunta 4: Nome do projeto
```
? What's your project's name? (windsurf-project)
Resposta: vendr (ou deixar windsurf-project)
```

### Pergunta 5: Diretório do código
```
? In which directory is your code located? ./
Resposta: Enter (aceitar ./)
```

### Pergunta 6: Framework detectado
```
Auto-detected Project Settings (Next.js):
- Build Command: next build
- Output Directory: .next
- Development Command: next dev --port $PORT

? Want to override the settings? [y/N]
Resposta: N (aceitar configurações automáticas)
```

---

## 🚀 DEPLOY INICIADO

Após responder as perguntas, o deploy inicia automaticamente:

```
🔗 Linked to seu-usuario/vendr (created .vercel)
🔍 Inspect: https://vercel.com/.../deployments/...
✅ Production: https://vendr-xxx.vercel.app [2m]
```

**Tempo total: ~2-3 minutos**

---

## ⚠️ SE PEDIR VARIÁVEIS DE AMBIENTE

Durante o build, pode aparecer:

```
Error: Missing environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Solução:**

### Opção A: Adicionar via Dashboard (Mais fácil)
```
1. Ir para: https://vercel.com/seu-usuario/vendr/settings/environment-variables
2. Adicionar as variáveis:
   - NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...

3. Fazer redeploy:
   vercel --prod
```

### Opção B: Adicionar via CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Colar o valor quando pedir

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Colar o valor quando pedir

# Redeploy
vercel --prod
```

---

## ✅ APÓS DEPLOY BEM-SUCEDIDO

Você verá algo como:

```
✅ Production: https://vendr-abc123.vercel.app [2m]
📝 Deployed to production. Run `vercel --prod` to overwrite later.
```

**Sua URL de produção:** https://vendr-abc123.vercel.app

---

## 🗄️ PASSO CRÍTICO: Executar Migrações SQL

**⚠️ OBRIGATÓRIO** - Fazer isso no Supabase de PRODUÇÃO:

### 1. Acessar Supabase Dashboard
```
https://supabase.com/dashboard
→ Selecionar projeto de PRODUÇÃO
→ SQL Editor
```

### 2. Executar Migração 1
```sql
-- Copiar TODO o conteúdo de:
-- c:\Users\lucas\CascadeProjects\windsurf-project\supabase-avatars-config-migration.sql

-- Colar no SQL Editor
-- Clicar "Run" ou Ctrl+Enter
```

**Resultado esperado:**
```
✅ Success. No rows returned
```

### 3. Executar Migração 2
```sql
-- Copiar TODO o conteúdo de:
-- c:\Users\lucas\CascadeProjects\windsurf-project\supabase-storage-setup.sql

-- Colar no SQL Editor
-- Clicar "Run"
```

**Resultado esperado:**
```
✅ Bucket 'avatars' criado
✅ 4 policies criadas
```

### 4. Verificar Storage
```
Supabase Dashboard:
→ Storage → Buckets → Verificar "avatars" existe
→ Storage → Policies → Verificar 4 políticas ativas
```

---

## 🧪 TESTAR EM PRODUÇÃO

Depois das migrações, testar:

### 1. Abrir URL de produção
```
https://vendr-abc123.vercel.app
```

### 2. Login
```
Usar credenciais existentes
```

### 3. Testar Features
```
✅ TopBar azul em todas as páginas
✅ /configuracoes → 7 tabs carregam
✅ Upload de avatar funciona
✅ Avatar aparece no TopBar
```

---

## 🔄 FUTUROS DEPLOYS

Para próximas atualizações:

```bash
# Fazer alterações no código
git add .
git commit -m "feat: nova feature"
git push origin main

# Deploy automático via Vercel ✅
# Ou manualmente:
vercel --prod
```

---

## 🐛 TROUBLESHOOTING

### Erro: "vercel" não é reconhecido
**Solução:**
```bash
npm install -g vercel
# Fechar e reabrir terminal
```

### Erro: "Authentication required"
**Solução:**
```bash
vercel login
# Navegador abre para autenticação
```

### Erro: Build falha
**Solução:**
```bash
# Verificar build local primeiro
npm run build

# Se passar, fazer deploy novamente
vercel --prod
```

### Deploy trava em "Building..."
**Solução:**
```bash
# Cancelar: Ctrl+C
# Verificar logs na Vercel Dashboard:
https://vercel.com/seu-usuario/vendr/deployments
```

---

## 📊 COMANDOS ÚTEIS

```bash
# Ver lista de projetos
vercel list

# Ver deployments
vercel ls

# Ver logs do último deploy
vercel logs

# Fazer deploy de produção
vercel --prod

# Remover projeto (cuidado!)
vercel remove vendr
```

---

## ✅ CHECKLIST FINAL

Marque conforme for fazendo:

**Deploy:**
- [ ] Executei `vercel` no terminal
- [ ] Respondi todas as perguntas
- [ ] Deploy concluído com sucesso
- [ ] URL de produção gerada

**Migrações:**
- [ ] `supabase-avatars-config-migration.sql` executada
- [ ] `supabase-storage-setup.sql` executada
- [ ] Bucket 'avatars' verificado
- [ ] Políticas RLS verificadas

**Testes:**
- [ ] TopBar azul em produção
- [ ] Página /configuracoes funciona
- [ ] Upload de avatar funciona
- [ ] Sem erros críticos no console

---

## 🎉 CONCLUSÃO

Quando tudo estiver marcado:
✅ **Vendr está em produção via Vercel CLI!**

**Próximos passos:**
1. Compartilhar URL com usuários
2. Configurar domínio customizado (opcional)
3. Monitorar analytics e logs

---

**Criado em:** 2025-10-09  
**Vercel CLI:** v48.2.9  
**Deploy Method:** CLI (Opção B)
