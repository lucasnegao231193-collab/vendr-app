-- ============================================================
-- Adicionar coluna "nome" na tabela perfis (se não existir)
-- ============================================================

-- Adicionar coluna nome
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS nome TEXT;

-- Verificar resultado
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'perfis'
ORDER BY ordinal_position;
