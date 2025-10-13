-- ============================================================
-- FIX: Ver valores existentes e corrigir antes de criar constraint
-- ============================================================

-- 1) Ver quais valores de plano existem atualmente
SELECT DISTINCT plano, COUNT(*) as quantidade
FROM public.empresas
GROUP BY plano;

-- 2) Atualizar valores NULL ou inválidos para 'free'
UPDATE public.empresas
SET plano = 'free'
WHERE plano IS NULL OR plano NOT IN ('free', 'basic', 'pro', 'enterprise', 'solo_free');

-- 3) Dropar constraint antigo
ALTER TABLE public.empresas 
DROP CONSTRAINT IF EXISTS empresas_plano_check;

-- 4) Criar novo constraint com todos os valores
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

-- 6) Ver valores finais
SELECT DISTINCT plano, COUNT(*) as quantidade
FROM public.empresas
GROUP BY plano;
