-- ============================================================
-- DIAGNÓSTICO: Vendas Solo não aparecem
-- ============================================================

-- 1. Verificar RLS na tabela vendas
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'vendas';

-- 2. Ver policies ativas
SELECT 
    'Policies Ativas' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'vendas';

-- 3. Contar vendas na tabela (sem filtro de empresa)
SELECT 
    'Total Vendas' as check_type,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'confirmado' THEN 1 END) as confirmadas,
    COUNT(CASE WHEN DATE(data_hora) = CURRENT_DATE THEN 1 END) as hoje
FROM public.vendas;

-- 4. Ver últimas 5 vendas
SELECT 
    'Últimas Vendas' as check_type,
    id,
    empresa_id,
    vendedor_id,
    produto_id,
    qtd,
    valor_unit,
    meio_pagamento,
    status,
    data_hora
FROM public.vendas
ORDER BY data_hora DESC
LIMIT 5;

-- 5. Verificar cotas solo
SELECT 
    'Cotas Solo' as check_type,
    sc.*,
    e.nome as empresa_nome,
    e.plano
FROM public.solo_cotas sc
JOIN public.empresas e ON e.id = sc.empresa_id
ORDER BY sc.updated_at DESC
LIMIT 5;

-- 6. Verificar se há vendas com data_hora NULL ou inválida
SELECT 
    'Vendas com Data Inválida' as check_type,
    COUNT(*) as total,
    COUNT(CASE WHEN data_hora IS NULL THEN 1 END) as data_null,
    COUNT(CASE WHEN data_hora::text = '' THEN 1 END) as data_vazia
FROM public.vendas;

-- 7. Verificar timezone das vendas
SELECT 
    'Timezone Check' as check_type,
    id,
    data_hora,
    data_hora AT TIME ZONE 'UTC' as data_utc,
    data_hora AT TIME ZONE 'America/Sao_Paulo' as data_sp,
    DATE(data_hora) as data_apenas,
    DATE(data_hora AT TIME ZONE 'America/Sao_Paulo') as data_sp_apenas
FROM public.vendas
ORDER BY data_hora DESC
LIMIT 3;

-- 8. Verificar produtos relacionados às vendas
SELECT 
    'Produtos das Vendas' as check_type,
    v.id as venda_id,
    v.produto_id,
    p.nome as produto_nome,
    p.ativo as produto_ativo
FROM public.vendas v
LEFT JOIN public.produtos p ON p.id = v.produto_id
ORDER BY v.data_hora DESC
LIMIT 5;
