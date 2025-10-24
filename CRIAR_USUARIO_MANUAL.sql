-- ============================================
-- CRIAR USUÁRIO MANUALMENTE - TESTE
-- ============================================
-- Execute este SQL no Supabase para criar um usuário de teste
-- ============================================

-- 1. Criar usuário diretamente na tabela auth.users
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
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste@exemplo.com',  -- MUDE ESTE EMAIL
    crypt('123456', gen_salt('bf')),  -- SENHA: 123456
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
) RETURNING id, email;

-- 2. Pegar o ID do usuário criado e usar nos próximos comandos
-- Substitua 'USER_ID_AQUI' pelo ID retornado acima

-- 3. Criar empresa
INSERT INTO empresas (nome, is_solo)
VALUES ('Meu Negócio Solo', true)
RETURNING id;

-- 4. Criar perfil
-- Substitua 'USER_ID_AQUI' e 'EMPRESA_ID_AQUI' pelos IDs acima
INSERT INTO perfis (user_id, empresa_id, role)
VALUES ('USER_ID_AQUI', 'EMPRESA_ID_AQUI', 'owner');

-- ============================================
-- PRONTO! Agora faça login com:
-- Email: teste@exemplo.com
-- Senha: 123456
-- ============================================
