-- ============================================================
-- CORRIGIR POLÍTICAS RLS PARA DEVOLUÇÕES
-- ============================================================

-- 1. Corrigir políticas da tabela ESTOQUES
-- Permitir que usuários autenticados possam inserir e atualizar estoque

DROP POLICY IF EXISTS "API pode inserir estoque" ON public.estoques;
CREATE POLICY "API pode inserir estoque"
ON public.estoques FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "API pode atualizar estoque" ON public.estoques;
CREATE POLICY "API pode atualizar estoque"
ON public.estoques FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Corrigir políticas da tabela ESTOQUE_MOVS
-- Permitir que usuários autenticados possam inserir movimentações

DROP POLICY IF EXISTS "API pode inserir movimentações" ON public.estoque_movs;
CREATE POLICY "API pode inserir movimentações"
ON public.estoque_movs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================
-- VERIFICAÇÕES
-- ============================================================

-- Verificar políticas de estoques
SELECT 'ESTOQUES' as tabela, policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'estoques'
ORDER BY policyname;

-- Verificar políticas de estoque_movs
SELECT 'ESTOQUE_MOVS' as tabela, policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'estoque_movs'
ORDER BY policyname;

-- ============================================================
-- TESTE MANUAL (opcional)
-- ============================================================
-- Descomente as linhas abaixo para testar manualmente

/*
-- 1. Buscar sua empresa_id
SELECT id, nome FROM public.empresas LIMIT 1;

-- 2. Buscar um produto
SELECT id, nome FROM public.produtos LIMIT 1;

-- 3. Testar INSERT (substitua os UUIDs)
INSERT INTO public.estoques (empresa_id, produto_id, qtd)
VALUES (
  'SEU_EMPRESA_ID_AQUI',
  'SEU_PRODUTO_ID_AQUI',
  10
)
ON CONFLICT (empresa_id, produto_id) 
DO UPDATE SET qtd = estoques.qtd + 10;

-- 4. Verificar se foi inserido
SELECT * FROM public.estoques 
WHERE empresa_id = 'SEU_EMPRESA_ID_AQUI';
*/
