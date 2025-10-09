-- ============================================================
-- VENDR - MÓDULO DE TRANSFERÊNCIAS DE ESTOQUE
-- Migração completa: transferencias, devolucoes, logs
-- Data: 2025-10-09
-- ============================================================

-- ============================================================
-- 1) ESTOQUE DO VENDEDOR
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vendedor_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade int NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendedor_id, produto_id)
);

CREATE INDEX IF NOT EXISTS idx_vendedor_estoque_vendedor ON public.vendedor_estoque(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_vendedor_estoque_produto ON public.vendedor_estoque(produto_id);

-- ============================================================
-- 2) TRANSFERÊNCIAS (Empresa → Vendedor)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  criado_por uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('aguardando_aceite','aceito','recusado','cancelado')) DEFAULT 'aguardando_aceite',
  total_itens int NOT NULL DEFAULT 0,
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transferencia_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transferencia_id uuid NOT NULL REFERENCES public.transferencias(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade int NOT NULL CHECK (quantidade > 0),
  preco_unit numeric(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transferencias_empresa ON public.transferencias(empresa_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transferencias_vendedor ON public.transferencias(vendedor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transferencia_itens_transferencia ON public.transferencia_itens(transferencia_id);

-- ============================================================
-- 3) DEVOLUÇÕES (Vendedor → Empresa)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.devolucoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  criado_por uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('aguardando_confirmacao','aceita','recusada','cancelada')) DEFAULT 'aguardando_confirmacao',
  total_itens int NOT NULL DEFAULT 0,
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.devolucao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devolucao_id uuid NOT NULL REFERENCES public.devolucoes(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade int NOT NULL CHECK (quantidade > 0),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devolucoes_empresa ON public.devolucoes(empresa_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devolucoes_vendedor ON public.devolucoes(vendedor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devolucao_itens_devolucao ON public.devolucao_itens(devolucao_id);

-- ============================================================
-- 4) LOGS DE AUDITORIA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.estoque_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('envio','aceite_envio','recusa_envio','devolucao_solicitada','aceite_devolucao','recusa_devolucao','extravio','ajuste_manual')),
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL,
  vendedor_id uuid REFERENCES public.vendedores(id) ON DELETE SET NULL,
  transferencia_id uuid REFERENCES public.transferencias(id) ON DELETE SET NULL,
  devolucao_id uuid REFERENCES public.devolucoes(id) ON DELETE SET NULL,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade int,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  observacao text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_estoque_logs_empresa ON public.estoque_logs(empresa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_logs_vendedor ON public.estoque_logs(vendedor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_logs_tipo ON public.estoque_logs(tipo, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_logs_transferencia ON public.estoque_logs(transferencia_id);
CREATE INDEX IF NOT EXISTS idx_estoque_logs_devolucao ON public.estoque_logs(devolucao_id);

-- ============================================================
-- 5) FUNÇÃO HELPER: Obter vendedor_id do usuário autenticado
-- ============================================================
CREATE OR REPLACE FUNCTION public.vendedor_id_for_user(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM public.vendedores 
    WHERE user_id = vendedor_id_for_user.user_id 
    LIMIT 1
  );
END;
$$;

-- ============================================================
-- 6) RLS POLICIES
-- ============================================================

-- Vendedor Estoque
ALTER TABLE public.vendedor_estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendedor vê apenas seu estoque" ON public.vendedor_estoque;
CREATE POLICY "Vendedor vê apenas seu estoque"
ON public.vendedor_estoque FOR SELECT
TO authenticated
USING (
  vendedor_id = public.vendedor_id_for_user(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.perfis p
    WHERE p.user_id = auth.uid()
      AND p.empresa_id IN (
        SELECT empresa_id FROM public.vendedores 
        WHERE id = vendedor_estoque.vendedor_id
      )
      AND p.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "Sistema pode inserir/atualizar estoque vendedor" ON public.vendedor_estoque;
CREATE POLICY "Sistema pode inserir/atualizar estoque vendedor"
ON public.vendedor_estoque FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Transferências
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem transferências da empresa ou vendedor" ON public.transferencias;
CREATE POLICY "Usuários veem transferências da empresa ou vendedor"
ON public.transferencias FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

DROP POLICY IF EXISTS "Empresa pode criar transferências" ON public.transferencias;
CREATE POLICY "Empresa pode criar transferências"
ON public.transferencias FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) IN ('owner', 'admin')
);

DROP POLICY IF EXISTS "Empresa pode atualizar transferências" ON public.transferencias;
CREATE POLICY "Empresa pode atualizar transferências"
ON public.transferencias FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

-- Transferência Itens
ALTER TABLE public.transferencia_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem itens de transferências acessíveis" ON public.transferencia_itens;
CREATE POLICY "Usuários veem itens de transferências acessíveis"
ON public.transferencia_itens FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.transferencias t
    WHERE t.id = transferencia_itens.transferencia_id
      AND (
        t.empresa_id = public.empresa_id_for_user(auth.uid())
        OR t.vendedor_id = public.vendedor_id_for_user(auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "Sistema pode gerenciar itens" ON public.transferencia_itens;
CREATE POLICY "Sistema pode gerenciar itens"
ON public.transferencia_itens FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Devoluções
ALTER TABLE public.devolucoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem devoluções da empresa ou vendedor" ON public.devolucoes;
CREATE POLICY "Usuários veem devoluções da empresa ou vendedor"
ON public.devolucoes FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

DROP POLICY IF EXISTS "Vendedor pode criar devoluções" ON public.devolucoes;
CREATE POLICY "Vendedor pode criar devoluções"
ON public.devolucoes FOR INSERT
TO authenticated
WITH CHECK (
  vendedor_id = public.vendedor_id_for_user(auth.uid())
);

DROP POLICY IF EXISTS "Empresa pode atualizar devoluções" ON public.devolucoes;
CREATE POLICY "Empresa pode atualizar devoluções"
ON public.devolucoes FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

-- Devolução Itens
ALTER TABLE public.devolucao_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem itens de devoluções acessíveis" ON public.devolucao_itens;
CREATE POLICY "Usuários veem itens de devoluções acessíveis"
ON public.devolucao_itens FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.devolucoes d
    WHERE d.id = devolucao_itens.devolucao_id
      AND (
        d.empresa_id = public.empresa_id_for_user(auth.uid())
        OR d.vendedor_id = public.vendedor_id_for_user(auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "Sistema pode gerenciar itens devolução" ON public.devolucao_itens;
CREATE POLICY "Sistema pode gerenciar itens devolução"
ON public.devolucao_itens FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Logs
ALTER TABLE public.estoque_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem logs da empresa" ON public.estoque_logs;
CREATE POLICY "Usuários veem logs da empresa"
ON public.estoque_logs FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

DROP POLICY IF EXISTS "Sistema pode criar logs" ON public.estoque_logs;
CREATE POLICY "Sistema pode criar logs"
ON public.estoque_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================
-- 7) TRIGGERS PARA UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_vendedor_estoque_updated_at ON public.vendedor_estoque;
CREATE TRIGGER update_vendedor_estoque_updated_at
    BEFORE UPDATE ON public.vendedor_estoque
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transferencias_updated_at ON public.transferencias;
CREATE TRIGGER update_transferencias_updated_at
    BEFORE UPDATE ON public.transferencias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_devolucoes_updated_at ON public.devolucoes;
CREATE TRIGGER update_devolucoes_updated_at
    BEFORE UPDATE ON public.devolucoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================
-- Verificar se todas as tabelas foram criadas:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%transferencia%' OR tablename LIKE '%devolucao%' OR tablename = 'vendedor_estoque' OR tablename = 'estoque_logs';
