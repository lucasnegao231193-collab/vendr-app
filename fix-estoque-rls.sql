-- Corrigir políticas RLS da tabela estoques
-- Permitir que a API (via service role) possa inserir e atualizar estoque

-- Política para permitir INSERT via API (para devoluções)
DROP POLICY IF EXISTS "API pode inserir estoque" ON public.estoques;
CREATE POLICY "API pode inserir estoque"
ON public.estoques FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir UPDATE via API (para devoluções)
DROP POLICY IF EXISTS "API pode atualizar estoque" ON public.estoques;
CREATE POLICY "API pode atualizar estoque"
ON public.estoques FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'estoques';
