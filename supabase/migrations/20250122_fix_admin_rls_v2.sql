-- Migration: Corrigir RLS da tabela admins (v2)
-- Problema: Políticas não estavam funcionando do lado do cliente
-- Solução: Simplificar e usar apenas policy básica

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "admins_can_view_admins" ON admins;
DROP POLICY IF EXISTS "users_can_view_own_admin_record" ON admins;
DROP POLICY IF EXISTS "admins_can_view_all_admins" ON admins;
DROP POLICY IF EXISTS "super_admins_can_create_admins" ON admins;

-- POLÍTICA SIMPLES: Qualquer usuário autenticado pode ler seus próprios dados de admin
CREATE POLICY "allow_authenticated_select_own_admin"
ON admins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- POLÍTICA: Super admins podem inserir novos admins
CREATE POLICY "super_admin_insert"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid() 
    AND super_admin = true
  )
);

-- POLÍTICA: Super admins podem atualizar admins
CREATE POLICY "super_admin_update"
ON admins
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid() 
    AND super_admin = true
  )
);

-- Verificar políticas aplicadas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'admins'
ORDER BY policyname;
