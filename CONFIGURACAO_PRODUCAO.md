# 🚀 CONFIGURAÇÃO PARA PRODUÇÃO

## ✅ CORREÇÕES APLICADAS NO CÓDIGO

### 1. **Botão Google em Todas as Abas** ✅
- ✅ Empresa pode fazer login com Google
- ✅ Autônomo pode fazer login com Google  
- ✅ Funcionário pode fazer login com Google

### 2. **Verificação de Email** ✅
- ✅ Sistema verifica se email foi confirmado
- ✅ Mensagem clara se email não foi confirmado
- ✅ Usuário não consegue fazer login sem confirmar email

### 3. **Mensagens de Erro Melhoradas** ✅
- ✅ Erros de OAuth tratados
- ✅ Erros de callback tratados
- ✅ Mensagens claras para o usuário

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### **1️⃣ Na Vercel - Variáveis de Ambiente**

Acesse: https://vercel.com → Seu Projeto → **Settings** → **Environment Variables**

Adicione:

```bash
# Site URL (IMPORTANTE!)
NEXT_PUBLIC_SITE_URL=https://www.venlo.com.br

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
```

**⚠️ IMPORTANTE**: Após adicionar, faça **Redeploy** do projeto!

---

### **2️⃣ No Supabase - URLs de Autenticação**

Acesse: https://supabase.com/dashboard → Seu Projeto → **Authentication** → **URL Configuration**

#### **Site URL:**
```
https://www.venlo.com.br
```

#### **Redirect URLs** (adicione todas):
```
https://venlo.com.br/*
https://www.venlo.com.br/*
https://venlo-app.vercel.app/*
http://localhost:3000/*
```

---

### **3️⃣ No Supabase - Habilitar Google OAuth**

1. **Authentication** → **Providers**
2. Clique em **Google**
3. **Enable Google provider**: ✅ ON
4. Configure:
   - **Client ID**: (do Google Cloud Console)
   - **Client Secret**: (do Google Cloud Console)
5. **Authorized redirect URIs**:
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```

---

### **4️⃣ No Google Cloud Console**

Se ainda não configurou o Google OAuth:

1. Acesse: https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client ID**
4. **Application type**: Web application
5. **Authorized JavaScript origins**:
   ```
   https://www.venlo.com.br
   https://venlo.com.br
   https://venlo-app.vercel.app
   http://localhost:3000
   ```
6. **Authorized redirect URIs**:
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```
7. Copie **Client ID** e **Client Secret** para o Supabase

---

### **5️⃣ No Supabase - Email Templates**

Configure os templates de email:

1. **Authentication** → **Email Templates**
2. **Confirm signup**:
   ```html
   <h2>Confirme seu email</h2>
   <p>Clique no link abaixo para confirmar seu email:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
   ```

3. **Reset password**:
   ```html
   <h2>Resetar senha</h2>
   <p>Clique no link abaixo para resetar sua senha:</p>
   <p><a href="{{ .ConfirmationURL }}">Resetar Senha</a></p>
   ```

---

## 🧪 TESTES NECESSÁRIOS

### **Teste 1: Login com Email/Senha**

1. Abra: https://www.venlo.com.br/login
2. Aba **Empresa**:
   - Digite email e senha
   - Clique em "Entrar como Empresa"
   - ✅ Deve redirecionar para `/admin` ou `/dashboard`

3. Aba **Autônomo**:
   - Digite email e senha
   - Clique em "Entrar como Autônomo"
   - ✅ Deve redirecionar para `/solo`

4. Aba **Funcionário**:
   - Digite email e senha
   - Clique em "Entrar como Funcionário"
   - ✅ Deve redirecionar para `/vendedor`

---

### **Teste 2: Login com Google**

1. Abra: https://www.venlo.com.br/login
2. Em **qualquer aba**, clique em "Continuar com Google"
3. Escolha conta Google
4. ✅ Deve redirecionar corretamente baseado no tipo de usuário

---

### **Teste 3: Cadastro Novo Usuário**

1. Abra: https://www.venlo.com.br/login
2. Clique em "Criar conta"
3. Preencha dados
4. ✅ Deve receber email de confirmação
5. Clique no link do email
6. ✅ Email deve ser confirmado
7. Faça login
8. ✅ Deve funcionar normalmente

---

### **Teste 4: Email Não Confirmado**

1. Crie uma conta mas **não confirme** o email
2. Tente fazer login
3. ✅ Deve mostrar mensagem: "Email não confirmado"
4. ✅ Não deve permitir login

---

### **Teste 5: Recuperação de Senha**

1. Clique em "Esqueci minha senha"
2. Digite email
3. ✅ Deve receber email com link
4. Clique no link
5. ✅ Deve poder resetar senha

---

## 📋 CHECKLIST FINAL

### **Vercel:**
- [ ] `NEXT_PUBLIC_SITE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] Redeploy feito após adicionar variáveis

### **Supabase:**
- [ ] Site URL: `https://www.venlo.com.br`
- [ ] Redirect URLs adicionadas (todas)
- [ ] Google OAuth habilitado
- [ ] Google Client ID configurado
- [ ] Google Client Secret configurado
- [ ] Email templates configurados

### **Google Cloud:**
- [ ] OAuth Client criado
- [ ] JavaScript origins configurados
- [ ] Redirect URIs configurados

### **Testes:**
- [ ] Login email/senha (Empresa) ✅
- [ ] Login email/senha (Autônomo) ✅
- [ ] Login email/senha (Funcionário) ✅
- [ ] Login Google (Empresa) ✅
- [ ] Login Google (Autônomo) ✅
- [ ] Login Google (Funcionário) ✅
- [ ] Cadastro novo usuário ✅
- [ ] Confirmação de email ✅
- [ ] Email não confirmado (bloqueio) ✅
- [ ] Recuperação de senha ✅

---

## 🎉 PRONTO!

Após seguir todos os passos, seu sistema de autenticação estará:
- ✅ Funcionando em produção
- ✅ Com Google OAuth
- ✅ Com confirmação de email
- ✅ Com recuperação de senha
- ✅ Com redirecionamentos corretos

**Qualquer dúvida, me avise!** 🚀
