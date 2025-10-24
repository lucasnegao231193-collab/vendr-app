-- ============================================
-- LIMPAR USUÁRIOS DE TESTE - EXECUTAR NO SUPABASE
-- ============================================

-- 1. Ver todos os usuários
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 20;

-- 2. Deletar usuários de teste (CUIDADO!)
-- Descomente as linhas abaixo e substitua os emails
-- DELETE FROM auth.users WHERE email LIKE '%teste%';
-- DELETE FROM auth.users WHERE email LIKE '%exemplo%';

-- 3. Verificar se há problemas com a tabela auth.users
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 4. Verificar configurações do Auth
SELECT * FROM auth.config;
