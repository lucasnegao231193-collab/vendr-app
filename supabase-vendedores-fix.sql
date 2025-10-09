-- ============================================================
-- CORREÇÃO: Adicionar user_id e email na tabela vendedores
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar coluna user_id (nullable inicialmente para não quebrar dados existentes)
ALTER TABLE public.vendedores 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Adicionar coluna email
ALTER TABLE public.vendedores 
ADD COLUMN IF NOT EXISTS email text;

-- 3. Adicionar coluna documento (renomear de 'doc' se necessário)
ALTER TABLE public.vendedores 
ADD COLUMN IF NOT EXISTS documento text;

-- 4. Criar índice para user_id (performance)
CREATE INDEX IF NOT EXISTS idx_vendedores_user_id ON public.vendedores(user_id);

-- 5. Criar índice para email (busca rápida)
CREATE INDEX IF NOT EXISTS idx_vendedores_email ON public.vendedores(email);

-- 6. Atualizar RLS para vendedores poderem ver seus próprios dados
DROP POLICY IF EXISTS "Vendedor vê seus próprios dados" ON public.vendedores;
CREATE POLICY "Vendedor vê seus próprios dados"
ON public.vendedores FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR user_id = auth.uid()
);

-- 7. Permitir owner criar vendedores
DROP POLICY IF EXISTS "Owner cria vendedores" ON public.vendedores;
CREATE POLICY "Owner cria vendedores"
ON public.vendedores FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- 8. Permitir owner atualizar vendedores
DROP POLICY IF EXISTS "Owner atualiza vendedores" ON public.vendedores;
CREATE POLICY "Owner atualiza vendedores"
ON public.vendedores FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- 9. Permitir owner deletar vendedores
DROP POLICY IF EXISTS "Owner deleta vendedores" ON public.vendedores;
CREATE POLICY "Owner deleta vendedores"
ON public.vendedores FOR DELETE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

COMMENT ON COLUMN public.vendedores.user_id IS 'Referência ao usuário no auth.users para login';
COMMENT ON COLUMN public.vendedores.email IS 'Email do vendedor (usado para login)';
COMMENT ON COLUMN public.vendedores.documento IS 'CPF/RG do vendedor';
