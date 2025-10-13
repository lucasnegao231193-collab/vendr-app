-- ============================================================
-- FIX: Adicionar políticas RLS APENAS para tabela EMPRESAS
-- ============================================================

-- 1) Ver se a tabela tem RLS habilitado
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- 2) Dropar policies antigas
DROP POLICY IF EXISTS "Usuarios podem criar suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Owners veem suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Owners podem atualizar suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuarios podem criar empresas" ON public.empresas;
DROP POLICY IF EXISTS "temp_allow_all_empresas" ON public.empresas;

-- 3) Criar policy de INSERT (MAIS PERMISSIVA)
CREATE POLICY "Qualquer usuario autenticado pode criar empresa"
ON public.empresas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4) Criar policy de SELECT
CREATE POLICY "Usuarios veem empresas onde sao owner ou tem perfil"
ON public.empresas
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid()
  )
);

-- 5) Criar policy de UPDATE
CREATE POLICY "Owners podem atualizar"
ON public.empresas
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- 6) Verificar se foi criado
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'empresas';
