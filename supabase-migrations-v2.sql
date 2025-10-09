-- ============================================================
-- VENDR V2 - MIGRAÇÃO COMPLETA
-- ============================================================

-- ============================================================
-- 1) ESTOQUE
-- ============================================================

-- Tabela de estoque (qtd atual por produto/empresa)
CREATE TABLE IF NOT EXISTS public.estoques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  qtd int NOT NULL DEFAULT 0 CHECK (qtd >= 0),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(empresa_id, produto_id)
);

-- Histórico de movimentações
CREATE TABLE IF NOT EXISTS public.estoque_movs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('entrada','saida','ajuste','saida_kit')),
  qtd int NOT NULL CHECK (qtd > 0),
  motivo text,
  kit_id uuid REFERENCES public.kits(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_estoques_empresa ON public.estoques(empresa_id);
CREATE INDEX IF NOT EXISTS idx_estoques_produto ON public.estoques(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_movs_empresa ON public.estoque_movs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_estoque_movs_tipo ON public.estoque_movs(tipo);
CREATE INDEX IF NOT EXISTS idx_estoque_movs_created ON public.estoque_movs(created_at DESC);

-- RLS para estoques
ALTER TABLE public.estoques ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário vê estoque da sua empresa" ON public.estoques;
CREATE POLICY "Usuário vê estoque da sua empresa"
ON public.estoques FOR SELECT
TO authenticated
USING (empresa_id = public.empresa_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Owner insere estoque" ON public.estoques;
CREATE POLICY "Owner insere estoque"
ON public.estoques FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

DROP POLICY IF EXISTS "Owner atualiza estoque" ON public.estoques;
CREATE POLICY "Owner atualiza estoque"
ON public.estoques FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- RLS para movimentações
ALTER TABLE public.estoque_movs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário vê movimentações da sua empresa" ON public.estoque_movs;
CREATE POLICY "Usuário vê movimentações da sua empresa"
ON public.estoque_movs FOR SELECT
TO authenticated
USING (empresa_id = public.empresa_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Sistema insere movimentações" ON public.estoque_movs;
CREATE POLICY "Sistema insere movimentações"
ON public.estoque_movs FOR INSERT
TO authenticated
WITH CHECK (empresa_id = public.empresa_id_for_user(auth.uid()));

-- ============================================================
-- 2) NOTIFICAÇÕES E INSIGHTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('alerta','insight','sistema','vendedor')),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  lida boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_empresa ON public.notificacoes(empresa_id, lida);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_notif_created ON public.notificacoes(created_at DESC);

-- RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário vê suas notificações" ON public.notificacoes;
CREATE POLICY "Usuário vê suas notificações"
ON public.notificacoes FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR empresa_id = public.empresa_id_for_user(auth.uid())
);

DROP POLICY IF EXISTS "Sistema cria notificações" ON public.notificacoes;
CREATE POLICY "Sistema cria notificações"
ON public.notificacoes FOR INSERT
TO authenticated
WITH CHECK (empresa_id = public.empresa_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Usuário marca como lida" ON public.notificacoes;
CREATE POLICY "Usuário marca como lida"
ON public.notificacoes FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 3) CHAT INTERNO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  texto text NOT NULL,
  lida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_msg_empresa ON public.mensagens(empresa_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON public.mensagens(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_receiver ON public.mensagens(receiver_id);
CREATE INDEX IF NOT EXISTS idx_msg_created ON public.mensagens(created_at DESC);

-- RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário vê suas mensagens" ON public.mensagens;
CREATE POLICY "Usuário vê suas mensagens"
ON public.mensagens FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() 
  OR receiver_id = auth.uid()
  OR (empresa_id = public.empresa_id_for_user(auth.uid()) AND public.role_for_user(auth.uid()) = 'owner')
);

DROP POLICY IF EXISTS "Usuário envia mensagens" ON public.mensagens;
CREATE POLICY "Usuário envia mensagens"
ON public.mensagens FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND empresa_id = public.empresa_id_for_user(auth.uid())
);

-- ============================================================
-- 4) GEOLOCALIZAÇÃO EM VENDAS
-- ============================================================

-- Adicionar campos de geolocalização
ALTER TABLE public.vendas 
  ADD COLUMN IF NOT EXISTS latitude decimal(10, 8),
  ADD COLUMN IF NOT EXISTS longitude decimal(11, 8),
  ADD COLUMN IF NOT EXISTS localizacao_timestamp timestamptz;

CREATE INDEX IF NOT EXISTS idx_vendas_geo ON public.vendas(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON COLUMN public.vendas.latitude IS 'Latitude da venda';
COMMENT ON COLUMN public.vendas.longitude IS 'Longitude da venda';
COMMENT ON COLUMN public.vendas.localizacao_timestamp IS 'Momento da captura da localização';

-- ============================================================
-- 5) METAS DIÁRIAS PARA VENDEDORES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.metas_vendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  valor_meta decimal(10,2) NOT NULL CHECK (valor_meta >= 0),
  data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vendedor_id, data)
);

CREATE INDEX IF NOT EXISTS idx_metas_vendedor ON public.metas_vendedores(vendedor_id, data);

-- RLS
ALTER TABLE public.metas_vendedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendedor vê suas metas" ON public.metas_vendedores;
CREATE POLICY "Vendedor vê suas metas"
ON public.metas_vendedores FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfis p
    WHERE p.user_id = auth.uid()
      AND p.empresa_id = metas_vendedores.empresa_id
  )
);

DROP POLICY IF EXISTS "Owner gerencia metas" ON public.metas_vendedores;
CREATE POLICY "Owner gerencia metas"
ON public.metas_vendedores FOR ALL
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
)
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- ============================================================
-- 6) DESPESAS E CONTROLE FINANCEIRO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.despesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  valor decimal(10,2) NOT NULL CHECK (valor > 0),
  categoria text NOT NULL CHECK (categoria IN ('operacional','compra_estoque','comissao','marketing','outros')),
  data date NOT NULL DEFAULT CURRENT_DATE,
  pago boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_despesas_empresa ON public.despesas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON public.despesas(data DESC);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON public.despesas(categoria);

-- RLS
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner vê despesas" ON public.despesas;
CREATE POLICY "Owner vê despesas"
ON public.despesas FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

DROP POLICY IF EXISTS "Owner gerencia despesas" ON public.despesas;
CREATE POLICY "Owner gerencia despesas"
ON public.despesas FOR ALL
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
)
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- ============================================================
-- 7) AUDITORIA
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acao text NOT NULL,
  entidade text NOT NULL,
  entidade_id uuid,
  detalhes jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_empresa ON public.audit_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner vê logs" ON public.audit_logs;
CREATE POLICY "Owner vê logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- ============================================================
-- 8) FUNÇÃO PARA BAIXAR ESTOQUE AO CRIAR KIT
-- ============================================================

CREATE OR REPLACE FUNCTION public.baixar_estoque_kit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
  estoque_atual int;
BEGIN
  -- Apenas para kits aceitos
  IF NEW.status = 'aceito' AND (OLD.status IS NULL OR OLD.status != 'aceito') THEN
    -- Para cada item do kit, baixar do estoque
    FOR item IN 
      SELECT produto_id, qtd_atribuida 
      FROM public.kit_itens 
      WHERE kit_id = NEW.id
    LOOP
      -- Verificar estoque atual
      SELECT qtd INTO estoque_atual
      FROM public.estoques
      WHERE empresa_id = NEW.empresa_id
        AND produto_id = item.produto_id;
      
      IF estoque_atual IS NULL OR estoque_atual < item.qtd_atribuida THEN
        RAISE EXCEPTION 'Estoque insuficiente para produto % (disponível: %, necessário: %)', 
          item.produto_id, COALESCE(estoque_atual, 0), item.qtd_atribuida;
      END IF;
      
      -- Baixar do estoque
      UPDATE public.estoques
      SET qtd = qtd - item.qtd_atribuida,
          updated_at = now()
      WHERE empresa_id = NEW.empresa_id
        AND produto_id = item.produto_id;
      
      -- Registrar movimentação
      INSERT INTO public.estoque_movs (
        empresa_id, 
        produto_id, 
        tipo, 
        qtd, 
        motivo, 
        kit_id
      ) VALUES (
        NEW.empresa_id,
        item.produto_id,
        'saida_kit',
        item.qtd_atribuida,
        'Baixa automática por aceite de kit',
        NEW.id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_baixar_estoque_kit ON public.kits;
CREATE TRIGGER trg_baixar_estoque_kit
  AFTER UPDATE OF status ON public.kits
  FOR EACH ROW
  EXECUTE FUNCTION public.baixar_estoque_kit();

-- ============================================================
-- 9) FUNÇÃO PARA CRIAR ESTOQUE QUANDO CRIAR PRODUTO
-- ============================================================

CREATE OR REPLACE FUNCTION public.init_estoque_produto()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar entrada no estoque com qtd = 0
  INSERT INTO public.estoques (empresa_id, produto_id, qtd)
  VALUES (NEW.empresa_id, NEW.id, 0)
  ON CONFLICT (empresa_id, produto_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_init_estoque_produto ON public.produtos;
CREATE TRIGGER trg_init_estoque_produto
  AFTER INSERT ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.init_estoque_produto();

-- ============================================================
-- 10) VIEW PARA INSIGHTS AUTOMÁTICOS
-- ============================================================

CREATE OR REPLACE VIEW public.v_insights_empresa AS
SELECT 
  e.id as empresa_id,
  -- Vendedores ociosos (sem venda há 2+ dias)
  (
    SELECT json_agg(json_build_object(
      'vendedor_id', v.id,
      'vendedor_nome', v.nome,
      'dias_sem_venda', DATE_PART('day', now() - MAX(vd.data_hora))
    ))
    FROM public.vendedores v
    LEFT JOIN public.vendas vd ON vd.vendedor_id = v.id AND vd.status = 'confirmado'
    WHERE v.empresa_id = e.id 
      AND v.ativo = true
    GROUP BY v.id, v.nome
    HAVING MAX(vd.data_hora) < (now() - interval '2 days') OR MAX(vd.data_hora) IS NULL
  ) as vendedores_ociosos,
  -- Produtos com estoque baixo (< 5 unidades)
  (
    SELECT json_agg(json_build_object(
      'produto_id', p.id,
      'produto_nome', p.nome,
      'qtd_atual', est.qtd
    ))
    FROM public.produtos p
    INNER JOIN public.estoques est ON est.produto_id = p.id
    WHERE p.empresa_id = e.id 
      AND p.ativo = true
      AND est.qtd < 5
  ) as estoque_baixo,
  -- Produto mais vendido do mês
  (
    SELECT json_build_object(
      'produto_id', p.id,
      'produto_nome', p.nome,
      'total_vendido', SUM(vd.qtd)
    )
    FROM public.vendas vd
    INNER JOIN public.produtos p ON p.id = vd.produto_id
    WHERE vd.data_hora >= date_trunc('month', now())
      AND vd.status = 'confirmado'
      AND p.empresa_id = e.id
    GROUP BY p.id, p.nome
    ORDER BY SUM(vd.qtd) DESC
    LIMIT 1
  ) as produto_mais_vendido
FROM public.empresas e;

COMMENT ON VIEW public.v_insights_empresa IS 'Insights automáticos para dashboard';

-- ============================================================
-- 11) VERIFICAÇÃO FINAL
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Vendr V2 - Migrações aplicadas com sucesso!';
  RAISE NOTICE '📦 Estoque e movimentações configurados';
  RAISE NOTICE '💬 Sistema de chat habilitado';
  RAISE NOTICE '🔔 Notificações e insights criados';
  RAISE NOTICE '📍 Geolocalização em vendas adicionada';
  RAISE NOTICE '💰 Módulo financeiro e despesas criado';
  RAISE NOTICE '🎯 Sistema de metas implementado';
  RAISE NOTICE '🔒 RLS configurado em todas as tabelas';
END $$;
