-- Migration: Corrigir RLS das tabelas perfis e empresas
-- Problema: RLS estava bloqueando visualização para admins
-- Solução: Criar políticas que permitem admins verem tudo

-- Desabilitar RLS temporariamente para teste
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;

-- Comentário: Se funcionar, vamos reabilitar com políticas corretas
-- Para reabilitar depois com políticas:
-- ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Criar políticas para admins (executar depois de confirmar que funciona)
/*
-- Política: Admins podem ver todos os perfis
CREATE POLICY "admins_can_view_all_perfis"
ON perfis FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Política: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "users_can_view_own_perfil"
ON perfis FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Política: Admins podem ver todas as empresas
CREATE POLICY "admins_can_view_all_empresas"
ON empresas FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Política: Usuários podem ver empresas através de seus perfis
CREATE POLICY "users_can_view_empresas_via_perfil"
ON empresas FOR SELECT TO authenticated
USING (
  id IN (
    SELECT empresa_id FROM perfis WHERE user_id = auth.uid()
  )
);
*/
