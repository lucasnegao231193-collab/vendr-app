-- ============================================================
-- DIAGNÓSTICO COMPLETO - Estrutura para onboarding autônomo
-- ============================================================

-- 1) VER ESTRUTURA DA TABELA EMPRESAS
SELECT 'EMPRESAS - Colunas:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'empresas'
ORDER BY ordinal_position;

-- 2) VER ESTRUTURA DA TABELA PERFIS
SELECT 'PERFIS - Colunas:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'perfis'
ORDER BY ordinal_position;

-- 3) VER ESTRUTURA DA TABELA SOLO_COTAS
SELECT 'SOLO_COTAS - Colunas:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'solo_cotas'
ORDER BY ordinal_position;

-- 4) VER TODAS AS FOREIGN KEYS
SELECT 'FOREIGN KEYS:' as info;
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('empresas', 'perfis', 'solo_cotas')
ORDER BY tc.table_name, kcu.column_name;

-- 5) VER CHECK CONSTRAINTS
SELECT 'CHECK CONSTRAINTS:' as info;
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'c'
    AND conrelid::regclass::text IN ('public.empresas', 'public.perfis', 'public.solo_cotas')
ORDER BY conrelid::regclass;

-- 6) VER STATUS RLS
SELECT 'RLS STATUS:' as info;
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('empresas', 'perfis', 'solo_cotas')
ORDER BY tablename;

-- 7) VER POLICIES RLS
SELECT 'RLS POLICIES:' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('empresas', 'perfis', 'solo_cotas')
ORDER BY tablename, policyname;
