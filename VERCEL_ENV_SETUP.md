# 🔧 Configurar Variáveis de Ambiente na Vercel

## 📋 **IMPORTANTE: Configure estas variáveis ANTES do deploy**

### **Como configurar:**

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione seu projeto** (vendr-app)
3. **Vá em:** Settings → Environment Variables
4. **Adicione cada variável abaixo**

---

## 🔑 **VARIÁVEIS OBRIGATÓRIAS:**

### **Supabase (Database):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://hjdbrxnemxiojcfxwcjd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZGJyeG5lbXhpb2pjZnh3Y2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTUyODUsImV4cCI6MjA3NTUzMTI4NX0.opxEfPTNeXVbQnYrwsTl26lxb-CkcXiWHBYIgdTI-c8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZGJyeG5lbXhpb2pjZnh3Y2pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk1NTI4NSwiZXhwIjoyMDc1NTMxMjg1fQ.0EBokZyTJVI5hTZZZ2hGkdwXuu_rYQU5Wrzyxt6fbEM
```

### **PIX (Pagamento):**

```env
NEXT_PUBLIC_VENDR_PIX_KEY=lucasnegao231193@gmail.com
```

### **App Config:**

```env
NEXT_PUBLIC_TZ=America/Sao_Paulo
NEXT_PUBLIC_APP_NAME=Vendr
```

### **WhatsApp Suporte:**

```env
NEXT_PUBLIC_SUPPORT_WHATSAPP=+5513981401945
NEXT_PUBLIC_SUPPORT_MESSAGE_OWNER=Olá! Sou empresa e preciso de ajuda no Vendr.
NEXT_PUBLIC_SUPPORT_MESSAGE_SELLER=Olá! Sou vendedor e preciso de ajuda no Vendr.
```

---

## ⚙️ **CONFIGURAÇÃO POR AMBIENTE:**

Para cada variável, selecione onde ela deve estar disponível:

- ✅ **Production** (obrigatório - ambiente de produção)
- ✅ **Preview** (opcional - branches de teste)
- ⬜ **Development** (opcional - desenvolvimento local)

**Recomendação:** Marque **Production** e **Preview** para todas.

---

## 🚀 **DEPOIS DE CONFIGURAR:**

1. **Salve todas as variáveis**
2. **Vá em:** Deployments
3. **Clique nos 3 pontos** do último deploy
4. **Clique em:** "Redeploy"

Ou simplesmente faça um novo commit e push que o deploy acontece automaticamente!

---

## ✅ **CHECKLIST:**

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_VENDR_PIX_KEY
- [ ] NEXT_PUBLIC_TZ
- [ ] NEXT_PUBLIC_APP_NAME
- [ ] NEXT_PUBLIC_SUPPORT_WHATSAPP
- [ ] NEXT_PUBLIC_SUPPORT_MESSAGE_OWNER
- [ ] NEXT_PUBLIC_SUPPORT_MESSAGE_SELLER

---

## 🔐 **SEGURANÇA:**

⚠️ **NUNCA commite o arquivo `.env.local` no GitHub!**

Ele já está no `.gitignore`, mas confira:
```bash
git check-ignore .env.local
# Deve retornar: .env.local
```

---

## 🆘 **PROBLEMA COM DEPLOY?**

Se o deploy falhar:

1. Verifique se **todas** as variáveis foram adicionadas
2. Confira se não há espaços extras nos valores
3. Tente fazer **Redeploy** na Vercel
4. Veja os logs de erro em: Deployments → [seu deploy] → View Function Logs

---

## 📞 **Link da Vercel:**

Dashboard: https://vercel.com/dashboard
Seu projeto: https://vercel.com/dashboard/projects

---

**Configurou tudo? Bora fazer o deploy! 🚀**
