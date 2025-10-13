-- ============================================================
-- FIX: ORDEM CORRETA - Dropar ANTES de fazer UPDATE
-- ============================================================

-- 1) PRIMEIRO: Dropar o constraint
ALTER TABLE public.empresas 
DROP CONSTRAINT IF EXISTS empresas_plano_check;

-- 2) Ver quais valores existem
SELECT DISTINCT plano, COUNT(*) as quantidade
FROM public.empresas
GROUP BY plano
ORDER BY plano;

-- 3) Atualizar valores NULL ou inválidos
UPDATE public.empresas
SET plano = 'free'
WHERE plano IS NULL 
   OR plano NOT IN ('free', 'basic', 'pro', 'enterprise', 'solo_free');

-- 4) AGORA SIM: Criar novo constraint
ALTER TABLE public.empresas 
ADD CONSTRAINT empresas_plano_check 
CHECK (plano IN ('free', 'basic', 'pro', 'enterprise', 'solo_free'));

-- 5) Verificar resultado
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.empresas'::regclass
  AND contype = 'c'
  AND conname LIKE '%plano%';
