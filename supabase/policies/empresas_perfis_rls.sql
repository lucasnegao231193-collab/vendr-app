-- Políticas RLS para permitir criação de empresa e perfil no cadastro

-- ============================================
-- EMPRESAS - Permitir usuário criar sua própria empresa
-- ============================================

-- Permitir INSERT para usuários autenticados (para cadastro)
CREATE POLICY "Usuários podem criar empresas"
ON empresas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir SELECT para donos da empresa
CREATE POLICY "Usuários podem ver suas empresas"
ON empresas
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT empresa_id 
    FROM perfis 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- PERFIS - Permitir usuário criar seu próprio perfil
-- ============================================

-- Permitir INSERT para o próprio usuário (para cadastro)
CREATE POLICY "Usuários podem criar seu próprio perfil"
ON perfis
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir SELECT para o próprio usuário
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON perfis
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Isso permite que usuários criem empresas e perfis durante o cadastro
-- 3. Após criar, só podem ver/editar suas próprias empresas
-- 4. Mantém segurança: cada usuário só acessa seus dados
