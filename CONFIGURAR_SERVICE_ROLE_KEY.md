# 🔑 CONFIGURAR SERVICE ROLE KEY - URGENTE!

## 🚨 O PROBLEMA:

O erro "AuthApiError: Database error saving new user" acontece porque falta a **SUPABASE_SERVICE_ROLE_KEY** no arquivo `.env.local`.

---

## ✅ SOLUÇÃO - 3 PASSOS:

### 1️⃣ Pegar a Service Role Key no Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** (⚙️) → **API**
4. Role até: **Project API keys**
5. Copie a chave: **`service_role`** (⚠️ NÃO é a anon key!)

---

### 2️⃣ Adicionar no `.env.local`:

Abra o arquivo `.env.local` na raiz do projeto e adicione:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Exemplo completo do `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3️⃣ Reiniciar o Servidor:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente:
npm run dev
```

---

## 🎯 TESTE NOVAMENTE:

1. Acesse: `http://localhost:3000/cadastro`
2. Clique em "Modo Pessoal"
3. Preencha o formulário
4. Abra o Console (F12)
5. Clique em "Criar Conta Solo"
6. **Veja os logs detalhados!**

---

## 📊 Logs Esperados:

```
🚀 Iniciando cadastro Solo...
✅ Validação OK
📝 Criando conta via API...
📊 Resposta da API: {success: true, userId: "...", empresaId: "..."}
✅ Conta criada com sucesso!
🔐 Fazendo login...
✅ Login realizado!
```

---

## ⚠️ IMPORTANTE:

- **Service Role Key** = Chave de ADMIN
- **NUNCA exponha** essa chave no frontend
- **Apenas no servidor** (API routes)
- **Não commite** no Git (já está no .gitignore)

---

## 🔍 Como Verificar se Está Configurada:

Abra o terminal e execute:

```bash
# Windows PowerShell:
echo $env:SUPABASE_SERVICE_ROLE_KEY

# Se retornar vazio, não está configurada!
```

---

## 🎉 RESULTADO:

Após configurar a Service Role Key:
- ✅ API funciona
- ✅ Cadastro funciona
- ✅ Empresa criada
- ✅ Perfil criado
- ✅ Login automático

---

**CONFIGURE A SERVICE ROLE KEY AGORA!** 🔑🚀
