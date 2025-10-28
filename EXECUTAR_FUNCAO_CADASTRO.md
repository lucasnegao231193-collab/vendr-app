# 🚀 EXECUTAR FUNÇÃO DE CADASTRO NO SUPABASE

## ⚡ IMPORTANTE - Execute Antes de Testar

Para o sistema de cadastro funcionar, você precisa criar a função SQL no Supabase.

---

## 📝 PASSO A PASSO

### 1️⃣ Abra o Supabase SQL Editor

Acesse: https://supabase.com/dashboard
- Selecione seu projeto
- Clique em **SQL Editor** no menu lateral

### 2️⃣ Execute a Função SQL

Cole e execute o conteúdo do arquivo:
```
supabase/functions/create_user_complete.sql
```

Ou copie e cole este SQL:

```sql
-- ================================================
-- FUNÇÃO PARA CRIAR USUÁRIO COMPLETO VIA SQL
-- ================================================

CREATE OR REPLACE FUNCTION create_user_complete(
  p_user_id uuid,
  p_identity_id uuid,
  p_empresa_id uuid,
  p_email text,
  p_password text,
  p_empresa_nome text,
  p_is_solo boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- 1. Criar usuário no auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    p_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '{}'::jsonb,
    false,
    '',
    '',
    '',
    ''
  );

  -- 2. Criar identity
  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_id::text,
    p_identity_id,
    p_user_id,
    jsonb_build_object(
      'sub', p_user_id::text,
      'email', p_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- 3. Criar empresa
  INSERT INTO empresas (
    id,
    nome,
    is_solo,
    plano,
    created_at
  ) VALUES (
    p_empresa_id,
    p_empresa_nome,
    p_is_solo,
    'free',
    NOW()
  );

  -- 4. Criar perfil
  INSERT INTO perfis (
    user_id,
    empresa_id,
    role,
    created_at
  ) VALUES (
    p_user_id,
    p_empresa_id,
    'owner',
    NOW()
  );

  -- Retornar sucesso
  result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'empresa_id', p_empresa_id,
    'email', p_email
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erro ao criar usuário: %', SQLERRM;
END;
$$;

-- Dar permissão para service_role
GRANT EXECUTE ON FUNCTION create_user_complete TO service_role;
```

### 3️⃣ Clique em RUN

Aguarde a mensagem: **"Success. No rows returned"**

---

## ✅ PRONTO!

Agora o sistema de cadastro está funcionando!

---

## 🧪 TESTAR

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/cadastro`
3. Escolha **Modo Pessoal** ou **Modo Empresa**
4. Preencha o formulário
5. Clique em **Criar Conta Gratuita**
6. Você será redirecionado automaticamente após o cadastro

---

## 📊 O QUE FOI CRIADO

### Páginas:
- ✅ `/cadastro` - Seleção de tipo de conta
- ✅ `/cadastro/pessoal` - Formulário conta pessoal
- ✅ `/cadastro/empresa` - Formulário conta empresa

### API:
- ✅ `/api/auth/signup` - Endpoint de cadastro

### Banco de Dados:
- ✅ `create_user_complete()` - Função SQL para criar usuário

---

## 🔒 SEGURANÇA

- ✅ Senhas criptografadas com bcrypt
- ✅ Validação de email duplicado
- ✅ Service role key protegida no servidor
- ✅ Função SQL com SECURITY DEFINER

---

## 🎯 FLUXO COMPLETO

```
1. Usuário acessa /cadastro
2. Escolhe Pessoal ou Empresa
3. Preenche formulário
4. Frontend chama /api/auth/signup
5. API chama função SQL create_user_complete()
6. Função cria: user + identity + empresa + perfil
7. API retorna sucesso
8. Frontend faz login automático
9. Redireciona para /dashboard
```

---

## 🐛 TROUBLESHOOTING

### Erro: "function create_user_complete does not exist"
- Execute o SQL da função no Supabase

### Erro: "Email já cadastrado"
- Use outro email ou delete o usuário existente

### Erro: "SUPABASE_SERVICE_ROLE_KEY not found"
- Verifique se a chave está no `.env.local`

---

**Tudo pronto! Execute a função SQL e teste o cadastro!** 🚀
