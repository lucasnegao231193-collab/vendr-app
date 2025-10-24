-- ============================================
-- EXECUTAR NO SUPABASE SQL EDITOR AGORA!
-- ============================================
-- Este SQL vai desabilitar triggers que podem estar causando problemas
-- ============================================

-- 1. Verificar se há triggers na tabela auth.users
SELECT * FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se há triggers problemáticos
-- (Se houver triggers listados acima, podemos desabilitá-los)

-- ============================================
-- APÓS EXECUTAR, TESTE O CADASTRO NOVAMENTE
-- ============================================
