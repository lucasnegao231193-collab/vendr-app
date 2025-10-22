-- Migration: Corrigir RLS da tabela catalogo_estabelecimentos
-- Problema: RLS estava bloqueando visualização para admins
-- Solução: Criar políticas que permitem admins verem tudo

-- Reabilitar RLS (se foi desabilitado)
ALTER TABLE catalogo_estabelecimentos ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "admins_can_view_all_estabelecimentos" ON catalogo_estabelecimentos;
DROP POLICY IF EXISTS "users_can_view_approved_estabelecimentos" ON catalogo_estabelecimentos;
DROP POLICY IF EXISTS "admins_can_manage_estabelecimentos" ON catalogo_estabelecimentos;
DROP POLICY IF EXISTS "users_can_insert_estabelecimentos" ON catalogo_estabelecimentos;

-- POLÍTICA 1: Admins podem ver TODOS os estabelecimentos
CREATE POLICY "admins_can_view_all_estabelecimentos"
ON catalogo_estabelecimentos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA 2: Usuários normais podem ver apenas estabelecimentos APROVADOS
CREATE POLICY "users_can_view_approved_estabelecimentos"
ON catalogo_estabelecimentos
FOR SELECT
TO authenticated
USING (
  aprovado = true
  AND NOT EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA 3: Admins podem ATUALIZAR estabelecimentos (aprovar, negar, destacar)
CREATE POLICY "admins_can_update_estabelecimentos"
ON catalogo_estabelecimentos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA 4: Usuários autenticados podem INSERIR estabelecimentos
CREATE POLICY "users_can_insert_estabelecimentos"
ON catalogo_estabelecimentos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- POLÍTICA 5: Admins podem DELETAR estabelecimentos
CREATE POLICY "admins_can_delete_estabelecimentos"
ON catalogo_estabelecimentos
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);

-- Comentário explicativo
COMMENT ON TABLE catalogo_estabelecimentos IS 'Tabela de estabelecimentos do catálogo com RLS configurado para admins e usuários';
