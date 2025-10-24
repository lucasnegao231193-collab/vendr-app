-- ============================================
-- SOLUÇÃO FINAL - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================
-- Este SQL vai verificar e corrigir problemas com triggers
-- ============================================

-- 1. Verificar triggers na tabela auth.users
SELECT 
    tgname AS trigger_name,
    tgenabled AS enabled
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- 2. Se houver triggers, desabilitar temporariamente
-- (Substitua 'nome_do_trigger' pelos nomes que aparecerem acima)
-- ALTER TABLE auth.users DISABLE TRIGGER nome_do_trigger;

-- 3. Desabilitar RLS nas tabelas
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se há políticas que podem estar bloqueando
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('empresas', 'perfis');

-- ============================================
-- APÓS EXECUTAR, TENTE O CADASTRO NOVAMENTE
-- ============================================

-- Se ainda não funcionar, podemos criar o usuário manualmente:
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'seu-email@exemplo.com',
--   crypt('sua-senha', gen_salt('bf')),
--   now(),
--   now(),
--   now()
-- );
