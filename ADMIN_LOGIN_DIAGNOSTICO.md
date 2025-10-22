# 🔍 Diagnóstico - Problema de Login Admin

## 📋 Problema Reportado
Ao fazer login com credenciais de admin, o sistema está redirecionando para outra página (dashboard/homeboard) em vez do painel admin (`/admin`).

## 🔎 Análise

### Possíveis Causas
1. **Admin com perfil duplicado**: O usuário admin pode ter um registro na tabela `admins` E na tabela `perfis`, causando conflito no redirecionamento
2. **Erro na verificação**: A query de verificação de admin pode estar falhando silenciosamente
3. **Cache**: Dados em cache podem estar causando o problema

### Como o Sistema Deveria Funcionar
1. Admin faz login pela página `/login`
2. Sistema verifica PRIMEIRO se é admin (tabela `admins`)
3. Se for admin → redireciona para `/admin`
4. Se não for admin → verifica perfil normal e redireciona apropriadamente

## 🛠️ Soluções Implementadas

### 1. ✅ Logs de Debug Adicionados
Foram adicionados logs detalhados em:
- `app/login/page.tsx` - Login com email/senha
- `app/auth/callback/route.ts` - Login OAuth (Google)

### 2. ✅ Script SQL de Diagnóstico
Criado script em `supabase/migrations/20250122_verificar_admin.sql`

## 📝 Instruções para Resolver

### Passo 1: Testar o Login com Logs
1. Abra o DevTools do navegador (F12)
2. Vá para a aba **Console**
3. Faça login com suas credenciais de admin
4. Observe os logs com emojis:
   - 🔍 = Login bem-sucedido
   - 🆔 = User ID
   - 👤 = Verificação de admin
   - ✅ = Admin identificado
   - 🎯 = Redirecionamento

**O que você verá:**
```
🔍 Login bem-sucedido, verificando tipo de usuário...
🆔 User ID: [seu-user-id]
👤 Verificação de admin: { adminData: {...}, adminError: null }
```

**Cenários:**

#### ✅ Cenário CORRETO (Admin):
```
✅ Usuário identificado como ADMIN, redirecionando para /admin
```
→ Você será redirecionado para `/admin`

#### ⚠️ Cenário PROBLEMA (Admin com perfil):
```
ℹ️ Não é admin, verificando perfil normal...
📋 Verificação de perfil: { perfil: {...}, perfilError: null }
🎯 Redirecionando para /dashboard (ou /solo)
```
→ Significa que você tem perfil de empresa além de admin

### Passo 2: Executar Script SQL de Diagnóstico

1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Abra o arquivo `supabase/migrations/20250122_verificar_admin.sql`
4. Execute **PASSO 1** primeiro (verificação):

```sql
-- Verificar se o admin existe
SELECT 
  'Admin registrado' as status,
  a.id,
  a.user_id,
  a.nome,
  a.email,
  a.super_admin
FROM admins a
JOIN auth.users u ON a.user_id = u.id
WHERE a.email = 'lucasnegao231192@gmail.com';
```

5. Execute a segunda query:

```sql
-- Verificar se o admin também tem perfil
SELECT 
  'Perfil do admin (PROBLEMA!)' as alerta,
  p.user_id,
  p.role,
  p.empresa_id
FROM perfis p
WHERE p.user_id IN (
  SELECT user_id FROM admins WHERE email = 'lucasnegao231192@gmail.com'
);
```

**Resultado esperado:**
- ✅ **1ª query retorna 1 linha** = Admin existe
- ✅ **2ª query retorna 0 linhas** = Admin não tem perfil (correto)
- ⚠️ **2ª query retorna linhas** = Admin tem perfil (PROBLEMA!)

### Passo 3: Corrigir (se necessário)

Se a 2ª query retornou linhas (admin tem perfil), execute o **PASSO 2** do script:

```sql
-- DESCOMENTE e execute apenas se houver problema:
DELETE FROM perfis 
WHERE user_id IN (
  SELECT user_id FROM admins WHERE email = 'lucasnegao231192@gmail.com'
);
```

### Passo 4: Limpar Cache

1. Faça **logout** do sistema
2. Limpe o cache do navegador (Ctrl + Shift + Delete)
3. Feche e reabra o navegador
4. Faça login novamente

## 🧪 Teste Final

Após executar as correções:

1. Abra o DevTools (F12)
2. Vá para Console
3. Faça login com seu email de admin
4. Você deve ver:
```
🔍 Login bem-sucedido, verificando tipo de usuário...
👤 Verificação de admin: { adminData: {...} }
✅ Usuário identificado como ADMIN, redirecionando para /admin
```
5. Você será redirecionado para `/admin`

## 📞 Próximos Passos

Se o problema persistir após seguir todos os passos:

1. **Compartilhe os logs do console** - Tire print dos logs que aparecem
2. **Resultado das queries SQL** - Mostre o que foi retornado
3. **Email usado** - Confirme o email que está tentando fazer login

## 🔐 Notas Importantes

- **Admin NÃO deve ter empresa ou perfil** - É uma conta pura com acesso apenas ao `/admin`
- **Admin NÃO deve fazer onboarding** - Criado diretamente no banco via SQL
- A verificação de admin é feita **ANTES** da verificação de perfil normal
- Use sempre o email cadastrado como admin: `lucasnegao231192@gmail.com`

## 📚 Arquivos Modificados

- ✅ `app/login/page.tsx` - Adicionados logs de debug
- ✅ `app/auth/callback/route.ts` - Adicionados logs de debug
- ✅ `supabase/migrations/20250122_verificar_admin.sql` - Script de diagnóstico
