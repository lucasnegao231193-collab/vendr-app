-- ================================================
-- FUNÇÃO PARA CRIAR USUÁRIO COMPLETO VIA SQL
-- ================================================
-- Esta função cria: usuário + identity + empresa + perfil
-- Bypass do Supabase Auth API que está com problema

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
  -- Em caso de erro, retornar detalhes
  RAISE EXCEPTION 'Erro ao criar usuário: %', SQLERRM;
END;
$$;

-- Dar permissão para service_role
GRANT EXECUTE ON FUNCTION create_user_complete TO service_role;
