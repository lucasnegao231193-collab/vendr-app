-- ============================================
-- CORREÇÃO COMPLETA DO SUPABASE AUTH
-- ============================================

-- 1. Verificar extensões necessárias
SELECT * FROM pg_extension WHERE extname IN ('pgcrypto', 'uuid-ossp');

-- Se não aparecer pgcrypto, criar:
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verificar e remover TODOS os triggers problemáticos
SELECT 
    tgname,
    tgrelid::regclass,
    proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
AND tgenabled != 'D';

-- Desabilitar TODOS os triggers na tabela auth.users
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'auth.users'::regclass 
        AND tgenabled != 'D'
    LOOP
        EXECUTE format('ALTER TABLE auth.users DISABLE TRIGGER %I', r.tgname);
    END LOOP;
END $$;

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'auth' AND tablename = 'users';

-- 4. Desabilitar RLS temporariamente (CUIDADO EM PRODUÇÃO!)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 5. Verificar se há constraints problemáticas
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass;

-- 6. Testar criação de usuário manualmente
-- (Descomente para testar)
/*
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
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste_manual@exemplo.com',
    crypt('123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
);
*/

-- ============================================
-- APÓS EXECUTAR, TENTE O CADASTRO NOVAMENTE
-- ============================================
