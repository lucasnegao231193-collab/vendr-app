# 🔧 Correções Aplicadas - Sistema de Vendedores

**Data:** 2025-10-09  
**Status:** ✅ Corrigido

---

## 🐛 Problemas Corrigidos

### 1. **Vendedor entrando como empresa**
**Causa:** Tabela `vendedores` não tinha coluna `user_id` para vincular ao auth.users  
**Solução:** 
- Criada migração SQL (`supabase-vendedores-fix.sql`)
- Adicionadas colunas: `user_id`, `email`, `documento`
- Políticas RLS atualizadas

### 2. **Erro ao criar vendedor**
**Causa:** Página tentava criar usuário direto com `signUp()` sem Service Role Key  
**Solução:**
- Página agora usa API `/api/admin/create-seller`
- API usa `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Validação de senha aumentada para 8 caracteres

### 3. **TopBar antiga aparecendo**
**Causa:** `AppShell.tsx` importava `TopBar` antigo  
**Solução:** Trocado para `GlobalTopBar` (azul #0057FF)

---

## 📋 Passos para Aplicar em Produção

### **Passo 1: Executar Migração SQL no Supabase**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto de PRODUÇÃO
3. Vá em **SQL Editor**
4. Copie TODO o conteúdo de: `supabase-vendedores-fix.sql`
5. Cole no editor e clique **Run** ou `Ctrl+Enter`
6. Aguarde mensagem: `Success. No rows returned`

### **Passo 2: Adicionar Variável de Ambiente na Vercel**

1. Acesse: https://vercel.com/seu-usuario/vendr-app/settings/environment-variables
2. Adicione nova variável:
   - **Nome:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Valor:** Sua Service Role Key do Supabase (Settings → API → service_role secret)
   - **Ambientes:** Production, Preview, Development
3. Clique **Save**

### **Passo 3: Fazer Deploy do Código**

Os arquivos já foram alterados:
- ✅ `app/vendedores/page.tsx` - Usa API em vez de signUp direto
- ✅ `components/layout/AppShell.tsx` - Usa GlobalTopBar azul
- ✅ `app/api/admin/create-seller/route.ts` - API completa

**Deploy será automático ao fazer push para GitHub.**

---

## 🧪 Como Testar

### **1. Criar Vendedor**
```
1. Login como empresa/owner
2. Ir em /vendedores
3. Clicar "Criar Vendedor"
4. Preencher:
   - Nome: João Silva
   - Email: joao@teste.com
   - Senha: senha12345 (mínimo 8 caracteres)
   - Telefone: (11) 98765-4321
   - CPF: 123.456.789-00
   - Comissão: 10%
5. Clicar "Criar"
6. Aguardar mensagem: "Vendedor criado!"
```

### **2. Login como Vendedor**
```
1. Fazer logout
2. Ir em /login
3. Clicar na tab "Funcionário"
4. Email: joao@teste.com
5. Senha: senha12345
6. Clicar "Entrar como Funcionário"
7. ✅ Deve redirecionar para /vendedor (não /dashboard)
```

### **3. Verificar TopBar**
```
✅ TopBar azul (#0057FF) em todas as páginas
✅ Logo branca no canto superior esquerdo
✅ SEM botão laranja "Suporte"
✅ Botão "Configurações" visível
✅ Avatar do usuário no canto direito
```

---

## 🔐 Segurança

### **Service Role Key**
- ⚠️ **NUNCA** exponha no frontend
- ✅ Usada SOMENTE na API `/api/admin/create-seller`
- ✅ Server-only (não vai para o cliente)
- ✅ Permite criar usuários no Supabase Auth

### **Políticas RLS**
- Vendedor vê SOMENTE seus próprios dados
- Owner vê todos os vendedores da empresa
- Owner pode criar/editar/deletar vendedores
- Vendedor NÃO pode criar outros vendedores

---

## 📊 Estrutura do Banco

```sql
public.vendedores
├── id (uuid, PK)
├── empresa_id (uuid, FK → empresas)
├── user_id (uuid, FK → auth.users) ← NOVO
├── nome (text)
├── email (text) ← NOVO
├── telefone (text)
├── documento (text) ← NOVO (antes era 'doc')
├── comissao_padrao (numeric)
├── ativo (boolean)
└── created_at (timestamptz)

public.perfis
├── user_id (uuid, PK, FK → auth.users)
├── empresa_id (uuid, FK → empresas)
├── role (text: 'owner' | 'seller')
└── created_at (timestamptz)
```

---

## 🚀 Próximos Passos

Após aplicar as correções:

1. ✅ Executar SQL no Supabase
2. ✅ Adicionar SUPABASE_SERVICE_ROLE_KEY na Vercel
3. ✅ Aguardar deploy automático (~1-2 min)
4. ✅ Limpar cache do navegador (Ctrl+Shift+R)
5. ✅ Testar criar vendedor
6. ✅ Testar login como vendedor
7. ✅ Verificar TopBar azul

---

## 📞 Troubleshooting

### **Erro: "Erro ao criar vendedor"**
- Verifique se executou a migração SQL
- Verifique se adicionou SUPABASE_SERVICE_ROLE_KEY na Vercel
- Veja logs da API: Vercel Dashboard → Deployments → Functions

### **Vendedor ainda entra como empresa**
- Verifique se o perfil foi criado com role='seller'
- Execute no SQL Editor:
```sql
SELECT * FROM perfis WHERE user_id = 'USER_ID_DO_VENDEDOR';
```

### **TopBar ainda aparece antiga**
- Limpe cache: Ctrl+Shift+R
- Abra em aba anônima: Ctrl+Shift+N
- Verifique se o deploy foi concluído na Vercel

---

**Criado por:** Windsurf AI  
**Última atualização:** 2025-10-09 20:50
