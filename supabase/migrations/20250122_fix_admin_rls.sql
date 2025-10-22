-- Migration: Corrigir RLS da tabela admins
-- Problema: Política antiga impedia verificação durante login (chicken and egg)
-- Solução: Permitir que usuários autenticados vejam seus próprios dados de admin

-- Remover política antiga que causava o problema
DROP POLICY IF EXISTS "admins_can_view_admins" ON admins;

-- Nova política: Usuários autenticados podem ver seus próprios dados de admin
-- Isso permite verificar se o usuário é admin durante o login
CREATE POLICY "users_can_view_own_admin_record" 
  ON admins 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política adicional: Admins podem ver todos os outros admins (para painel admin)
CREATE POLICY "admins_can_view_all_admins" 
  ON admins 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Comentários
COMMENT ON POLICY "users_can_view_own_admin_record" ON admins IS 
  'Permite que usuários vejam seus próprios dados de admin durante login';
COMMENT ON POLICY "admins_can_view_all_admins" ON admins IS 
  'Permite que admins vejam todos os outros admins no painel';
