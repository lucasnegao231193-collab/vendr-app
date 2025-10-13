-- ============================================================
-- FIX: Desabilitar RLS na tabela produtos
-- ============================================================

-- Desabilitar RLS
ALTER TABLE public.produtos DISABLE ROW LEVEL SECURITY;

-- Dropar policies (se existirem)
DROP POLICY IF EXISTS "Empresa vê seus produtos" ON public.produtos;
DROP POLICY IF EXISTS "Empresa pode gerenciar produtos" ON public.produtos;
DROP POLICY IF EXISTS "temp_allow_all_produtos" ON public.produtos;

-- Verificar
SELECT 
    'STATUS produtos:' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'produtos';
