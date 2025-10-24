-- ============================================
-- EXECUTE ESTE SQL NO SUPABASE AGORA!
-- ============================================
-- Acesse: https://supabase.com/dashboard
-- Vá em: SQL Editor
-- Cole este código e clique em RUN
-- ============================================

-- 1. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Usuários podem criar empresas" ON empresas;
DROP POLICY IF EXISTS "Usuários podem ver suas empresas" ON empresas;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON perfis;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON perfis;

-- 2. CRIAR POLÍTICAS CORRETAS

-- EMPRESAS: Permitir INSERT para qualquer usuário autenticado
CREATE POLICY "allow_authenticated_insert_empresas"
ON empresas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- EMPRESAS: Permitir SELECT apenas para empresas do usuário
CREATE POLICY "allow_select_own_empresas"
ON empresas
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT empresa_id FROM perfis WHERE user_id = auth.uid()
  )
);

-- EMPRESAS: Permitir UPDATE apenas para empresas do usuário
CREATE POLICY "allow_update_own_empresas"
ON empresas
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT empresa_id FROM perfis WHERE user_id = auth.uid()
  )
);

-- PERFIS: Permitir INSERT para o próprio usuário
CREATE POLICY "allow_insert_own_perfil"
ON perfis
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- PERFIS: Permitir SELECT para o próprio usuário
CREATE POLICY "allow_select_own_perfil"
ON perfis
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- PERFIS: Permitir UPDATE para o próprio usuário
CREATE POLICY "allow_update_own_perfil"
ON perfis
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 3. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRONTO! Agora teste o cadastro novamente
-- ============================================
