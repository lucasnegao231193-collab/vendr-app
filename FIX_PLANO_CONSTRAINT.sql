-- ============================================================
-- FIX: Permitir valor 'solo_free' na coluna plano
-- ============================================================

-- OPÇÃO 1: Dropar o constraint temporariamente (MAIS RÁPIDO)
ALTER TABLE public.empresas 
DROP CONSTRAINT IF EXISTS empresas_plano_check;

-- OPÇÃO 2: Criar novo constraint com 'solo_free' incluído
ALTER TABLE public.empresas 
ADD CONSTRAINT empresas_plano_check 
CHECK (plano IN ('free', 'basic', 'pro', 'enterprise', 'solo_free'));

-- Verificar
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.empresas'::regclass
  AND contype = 'c'
  AND conname LIKE '%plano%';
