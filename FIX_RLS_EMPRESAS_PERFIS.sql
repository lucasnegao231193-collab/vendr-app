-- ============================================================
-- FIX: Políticas RLS para permitir criação de contas autônomas
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- 1) DROPAR POLICIES ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Usuarios podem criar empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuarios podem criar perfis" ON public.perfis;
DROP POLICY IF EXISTS "Owners veem suas empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuarios veem seus perfis" ON public.perfis;

-- 2) EMPRESAS - Permitir que usuário crie empresa onde ele é owner
CREATE POLICY "Usuarios podem criar suas empresas"
ON public.empresas
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "Owners veem suas empresas"
ON public.empresas
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR id IN (
    SELECT empresa_id FROM public.perfis 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Owners podem atualizar suas empresas"
ON public.empresas
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
);

-- 3) PERFIS - Permitir que usuário crie seu próprio perfil
CREATE POLICY "Usuarios podem criar seus perfis"
ON public.perfis
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Usuarios veem seus perfis"
ON public.perfis
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR empresa_id IN (
    SELECT id FROM public.empresas WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Usuarios podem atualizar seus perfis"
ON public.perfis
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
);

-- 4) SOLO_COTAS - Permitir gestão de cotas
DROP POLICY IF EXISTS "Owners gerenciam cotas" ON public.solo_cotas;

CREATE POLICY "Owners gerenciam suas cotas"
ON public.solo_cotas
FOR ALL
TO authenticated
USING (
  empresa_id IN (
    SELECT id FROM public.empresas WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  empresa_id IN (
    SELECT id FROM public.empresas WHERE owner_id = auth.uid()
  )
);

-- ============================================================
-- VERIFICAÇÃO: Listar todas as policies das tabelas principais
-- ============================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('empresas', 'perfis', 'solo_cotas')
ORDER BY tablename, policyname;

-- ============================================================
-- PRONTO! Agora você pode criar contas autônomas
-- ============================================================
