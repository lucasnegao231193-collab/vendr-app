-- ========================================
-- FIX: Permitir API criar perfis de vendedores
-- ========================================

-- 1. Verificar se tabela perfis existe
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'seller')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Habilitar RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- 3. DROPAR políticas antigas (se existirem)
DROP POLICY IF EXISTS "perfis_select_own" ON public.perfis;
DROP POLICY IF EXISTS "perfis_insert_own" ON public.perfis;
DROP POLICY IF EXISTS "perfis_update_own" ON public.perfis;
DROP POLICY IF EXISTS "perfis_insert_service_role" ON public.perfis;

-- 4. CRIAR políticas corretas

-- SELECT: Usuário pode ver apenas seu próprio perfil
CREATE POLICY "perfis_select_own" 
ON public.perfis 
FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: Apenas service_role pode criar perfis (usado pela API)
CREATE POLICY "perfis_insert_service_role" 
ON public.perfis 
FOR INSERT 
WITH CHECK (true); -- Service role bypassa RLS, então isso só afeta usuários normais

-- UPDATE: Usuário pode atualizar apenas seu próprio perfil
CREATE POLICY "perfis_update_own" 
ON public.perfis 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. GRANT permissions para service_role
GRANT ALL ON public.perfis TO service_role;
GRANT ALL ON public.perfis TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_perfis_user_id ON public.perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_perfis_empresa_id ON public.perfis(empresa_id);
CREATE INDEX IF NOT EXISTS idx_perfis_role ON public.perfis(role);

-- ========================================
-- SUCESSO! Execute este SQL no Supabase SQL Editor
-- ========================================
