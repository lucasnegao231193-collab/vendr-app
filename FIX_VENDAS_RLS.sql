-- ============================================================
-- FIX: Desabilitar RLS na tabela vendas
-- ============================================================

-- Desabilitar RLS
ALTER TABLE public.vendas DISABLE ROW LEVEL SECURITY;

-- Dropar policies (se existirem)
DROP POLICY IF EXISTS "Empresa vê suas vendas" ON public.vendas;
DROP POLICY IF EXISTS "Vendedor vê suas vendas" ON public.vendas;
DROP POLICY IF EXISTS "Empresa pode gerenciar vendas" ON public.vendas;
DROP POLICY IF EXISTS "temp_allow_all_vendas" ON public.vendas;

-- Verificar
SELECT 
    'STATUS vendas:' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'vendas';

-- Ver estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'vendas'
ORDER BY ordinal_position;
