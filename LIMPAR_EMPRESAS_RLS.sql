-- ============================================================
-- LIMPAR TODAS AS POLICIES DE EMPRESAS E CRIAR UMA SIMPLES
-- ============================================================

-- 1) DELETAR TODAS AS POLICIES DE EMPRESAS
DROP POLICY IF EXISTS "Proprietário pode atualizar sua empresa" ON public.empresas;
DROP POLICY IF EXISTS "Proprietário pode entrar em empresa" ON public.empresas;
DROP POLICY IF EXISTS "Proprietários podem atualizar suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Donos veem apenas suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Donos veem suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuários podem criar suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuário vê apenas sua empresa" ON public.empresas;
DROP POLICY IF EXISTS "Owners veem suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Owners podem atualizar suas empresas" ON public.empresas;

-- 2) CRIAR UMA POLICY TEMPORÁRIA SUPER PERMISSIVA
CREATE POLICY "temp_allow_all_empresas"
ON public.empresas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3) VERIFICAR
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'empresas';
