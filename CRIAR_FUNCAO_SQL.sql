-- ============================================
-- CRIAR FUNÇÃO PARA ADICIONAR USUÁRIOS
-- ============================================
-- Execute no Supabase SQL Editor
-- ============================================

CREATE OR REPLACE FUNCTION create_user_with_empresa(
    p_email TEXT,
    p_password TEXT,
    p_nome_negocio TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_empresa_id UUID;
    v_encrypted_password TEXT;
BEGIN
    -- Gerar ID
    v_user_id := gen_random_uuid();
    
    -- Criptografar senha
    v_encrypted_password := crypt(p_password, gen_salt('bf'));
    
    -- Inserir usuário
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
        raw_user_meta_data
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        p_email,
        v_encrypted_password,
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}'
    );
    
    -- Criar empresa
    INSERT INTO empresas (nome, is_solo)
    VALUES (p_nome_negocio, true)
    RETURNING id INTO v_empresa_id;
    
    -- Criar perfil
    INSERT INTO perfis (user_id, empresa_id, role)
    VALUES (v_user_id, v_empresa_id, 'owner');
    
    -- Retornar sucesso
    RETURN json_build_object(
        'success', true,
        'user_id', v_user_id,
        'empresa_id', v_empresa_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- ============================================
-- TESTAR A FUNÇÃO
-- ============================================
SELECT create_user_with_empresa(
    'teste@exemplo.com',
    '123456',
    'Meu Negócio Teste'
);
