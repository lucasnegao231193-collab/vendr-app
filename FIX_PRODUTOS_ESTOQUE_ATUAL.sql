-- ============================================================
-- FIX: Adicionar coluna estoque_atual na tabela produtos
-- ============================================================

-- Adicionar coluna estoque_atual
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS estoque_atual INTEGER DEFAULT 0;

-- Adicionar coluna ativo (se não existir)
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Verificar estrutura
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'produtos'
ORDER BY ordinal_position;
