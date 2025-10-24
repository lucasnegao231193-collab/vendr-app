-- ============================================
-- DESABILITAR TRIGGER PROBLEMÁTICO
-- ============================================

-- 1. Ver todos os triggers
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth';

-- 2. Desabilitar o trigger problemático
DROP TRIGGER IF EXISTS auto_create_solo_empresa ON auth.users;

-- 3. Desabilitar a função também
DROP FUNCTION IF EXISTS auto_create_solo_empresa();

-- ============================================
-- PRONTO! Agora tente criar usuário novamente
-- ============================================
