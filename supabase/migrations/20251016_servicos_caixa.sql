-- =====================================================
-- MIGRATION: Módulo de Serviços (Solo) + Módulo de Caixa
-- Data: 16/10/2025
-- =====================================================

-- =====================================================
-- 1. TABELA: solo_servicos
-- =====================================================
CREATE TABLE IF NOT EXISTS solo_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Limpeza', 'Beleza', 'Construção', 'Transporte', 'Outros')),
  descricao TEXT,
  valor_unitario NUMERIC(10, 2) NOT NULL CHECK (valor_unitario >= 0),
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Concluído', 'Pago')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para solo_servicos
CREATE INDEX idx_solo_servicos_user_id ON solo_servicos(user_id);
CREATE INDEX idx_solo_servicos_status ON solo_servicos(status);
CREATE INDEX idx_solo_servicos_data ON solo_servicos(data);
CREATE INDEX idx_solo_servicos_categoria ON solo_servicos(categoria);

-- RLS para solo_servicos
ALTER TABLE solo_servicos ENABLE ROW LEVEL SECURITY;

-- Política: usuário vê apenas seus próprios serviços
CREATE POLICY "Usuários podem ver seus próprios serviços"
  ON solo_servicos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios serviços"
  ON solo_servicos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios serviços"
  ON solo_servicos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios serviços"
  ON solo_servicos FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_solo_servicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER solo_servicos_updated_at
  BEFORE UPDATE ON solo_servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_solo_servicos_updated_at();

-- =====================================================
-- 2. TABELA: caixas
-- =====================================================
CREATE TABLE IF NOT EXISTS caixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escopo TEXT NOT NULL CHECK (escopo IN ('empresa', 'vendedor', 'solo')),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES vendedores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  responsavel_id UUID NOT NULL REFERENCES auth.users(id),
  saldo_inicial NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (saldo_inicial >= 0),
  saldo_fechamento NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Fechado')),
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints de consistência
  CONSTRAINT caixa_escopo_empresa CHECK (
    (escopo = 'empresa' AND empresa_id IS NOT NULL AND vendedor_id IS NULL AND user_id IS NULL) OR
    (escopo = 'vendedor' AND empresa_id IS NOT NULL AND vendedor_id IS NOT NULL AND user_id IS NULL) OR
    (escopo = 'solo' AND empresa_id IS NULL AND vendedor_id IS NULL AND user_id IS NOT NULL)
  ),
  CONSTRAINT caixa_fechamento_valido CHECK (
    (status = 'Aberto' AND data_fechamento IS NULL AND saldo_fechamento IS NULL) OR
    (status = 'Fechado' AND data_fechamento IS NOT NULL AND saldo_fechamento IS NOT NULL)
  )
);

-- Índices para caixas
CREATE INDEX idx_caixas_escopo ON caixas(escopo);
CREATE INDEX idx_caixas_empresa_id ON caixas(empresa_id);
CREATE INDEX idx_caixas_vendedor_id ON caixas(vendedor_id);
CREATE INDEX idx_caixas_user_id ON caixas(user_id);
CREATE INDEX idx_caixas_status ON caixas(status);
CREATE INDEX idx_caixas_data_abertura ON caixas(data_abertura);
CREATE INDEX idx_caixas_escopo_status ON caixas(escopo, status);

-- Índice único para garantir apenas 1 caixa aberto por escopo
-- Usando CAST para garantir imutabilidade
CREATE UNIQUE INDEX idx_caixas_empresa_aberto 
  ON caixas(empresa_id, (data_abertura::date)) 
  WHERE escopo = 'empresa' AND status = 'Aberto';

CREATE UNIQUE INDEX idx_caixas_vendedor_aberto 
  ON caixas(vendedor_id, (data_abertura::date)) 
  WHERE escopo = 'vendedor' AND status = 'Aberto';

CREATE UNIQUE INDEX idx_caixas_solo_aberto 
  ON caixas(user_id, (data_abertura::date)) 
  WHERE escopo = 'solo' AND status = 'Aberto';

-- RLS para caixas
ALTER TABLE caixas ENABLE ROW LEVEL SECURITY;

-- Política para empresa: admins da empresa podem ver
CREATE POLICY "Admins podem ver caixas da empresa"
  ON caixas FOR SELECT
  USING (
    escopo = 'empresa' AND
    empresa_id IN (
      SELECT empresa_id FROM perfis 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Política para vendedor: vendedor vê seu próprio caixa + admins da empresa
CREATE POLICY "Vendedores podem ver seu próprio caixa"
  ON caixas FOR SELECT
  USING (
    (escopo = 'vendedor' AND vendedor_id IN (
      SELECT id FROM vendedores WHERE user_id = auth.uid()
    )) OR
    (escopo = 'vendedor' AND empresa_id IN (
      SELECT empresa_id FROM perfis 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ))
  );

-- Política para solo: usuário vê apenas seu caixa
CREATE POLICY "Usuários solo podem ver seu próprio caixa"
  ON caixas FOR SELECT
  USING (escopo = 'solo' AND user_id = auth.uid());

-- Políticas de INSERT (similar ao SELECT)
CREATE POLICY "Admins podem criar caixas da empresa"
  ON caixas FOR INSERT
  WITH CHECK (
    escopo = 'empresa' AND
    empresa_id IN (
      SELECT empresa_id FROM perfis 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Vendedores podem criar seu próprio caixa"
  ON caixas FOR INSERT
  WITH CHECK (
    escopo = 'vendedor' AND
    vendedor_id IN (
      SELECT id FROM vendedores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários solo podem criar seu próprio caixa"
  ON caixas FOR INSERT
  WITH CHECK (escopo = 'solo' AND user_id = auth.uid());

-- Políticas de UPDATE (mesmas regras do SELECT)
CREATE POLICY "Admins podem atualizar caixas da empresa"
  ON caixas FOR UPDATE
  USING (
    escopo = 'empresa' AND
    empresa_id IN (
      SELECT empresa_id FROM perfis 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Vendedores podem atualizar seu próprio caixa"
  ON caixas FOR UPDATE
  USING (
    escopo = 'vendedor' AND
    vendedor_id IN (
      SELECT id FROM vendedores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários solo podem atualizar seu próprio caixa"
  ON caixas FOR UPDATE
  USING (escopo = 'solo' AND user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_caixas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER caixas_updated_at
  BEFORE UPDATE ON caixas
  FOR EACH ROW
  EXECUTE FUNCTION update_caixas_updated_at();

-- =====================================================
-- 3. TABELA: caixa_movimentacoes
-- =====================================================
CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id UUID NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Saida')),
  metodo_pagamento TEXT NOT NULL CHECK (metodo_pagamento IN ('Dinheiro', 'PIX', 'Debito', 'Credito', 'Outros')),
  valor NUMERIC(10, 2) NOT NULL CHECK (valor > 0),
  venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
  solo_servico_id UUID REFERENCES solo_servicos(id) ON DELETE SET NULL,
  devolucao_id UUID REFERENCES devolucoes(id) ON DELETE SET NULL,
  transferencia_id UUID REFERENCES transferencias(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para caixa_movimentacoes
CREATE INDEX idx_caixa_mov_caixa_id ON caixa_movimentacoes(caixa_id);
CREATE INDEX idx_caixa_mov_tipo ON caixa_movimentacoes(tipo);
CREATE INDEX idx_caixa_mov_metodo ON caixa_movimentacoes(metodo_pagamento);
CREATE INDEX idx_caixa_mov_venda_id ON caixa_movimentacoes(venda_id);
CREATE INDEX idx_caixa_mov_servico_id ON caixa_movimentacoes(solo_servico_id);
CREATE INDEX idx_caixa_mov_devolucao_id ON caixa_movimentacoes(devolucao_id);
CREATE INDEX idx_caixa_mov_transferencia_id ON caixa_movimentacoes(transferencia_id);
CREATE INDEX idx_caixa_mov_data_hora ON caixa_movimentacoes(data_hora);

-- RLS para caixa_movimentacoes (herda permissões do caixa)
ALTER TABLE caixa_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver movimentações dos seus caixas"
  ON caixa_movimentacoes FOR SELECT
  USING (
    caixa_id IN (SELECT id FROM caixas)
  );

CREATE POLICY "Usuários podem inserir movimentações nos seus caixas"
  ON caixa_movimentacoes FOR INSERT
  WITH CHECK (
    caixa_id IN (SELECT id FROM caixas)
  );

CREATE POLICY "Usuários podem atualizar movimentações dos seus caixas"
  ON caixa_movimentacoes FOR UPDATE
  USING (
    caixa_id IN (SELECT id FROM caixas)
  );

CREATE POLICY "Usuários podem deletar movimentações dos seus caixas"
  ON caixa_movimentacoes FOR DELETE
  USING (
    caixa_id IN (SELECT id FROM caixas)
  );

-- =====================================================
-- 4. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular saldo teórico do caixa
CREATE OR REPLACE FUNCTION calcular_saldo_teorico(p_caixa_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_saldo_inicial NUMERIC;
  v_total_entradas NUMERIC;
  v_total_saidas NUMERIC;
BEGIN
  -- Buscar saldo inicial
  SELECT saldo_inicial INTO v_saldo_inicial
  FROM caixas
  WHERE id = p_caixa_id;
  
  -- Calcular total de entradas
  SELECT COALESCE(SUM(valor), 0) INTO v_total_entradas
  FROM caixa_movimentacoes
  WHERE caixa_id = p_caixa_id AND tipo = 'Entrada';
  
  -- Calcular total de saídas
  SELECT COALESCE(SUM(valor), 0) INTO v_total_saidas
  FROM caixa_movimentacoes
  WHERE caixa_id = p_caixa_id AND tipo = 'Saida';
  
  RETURN v_saldo_inicial + v_total_entradas - v_total_saidas;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se existe caixa aberto
CREATE OR REPLACE FUNCTION existe_caixa_aberto(
  p_escopo TEXT,
  p_empresa_id UUID DEFAULT NULL,
  p_vendedor_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_escopo = 'empresa' THEN
    SELECT COUNT(*) INTO v_count
    FROM caixas
    WHERE escopo = 'empresa' 
      AND empresa_id = p_empresa_id 
      AND status = 'Aberto'
      AND data_abertura::date = CURRENT_DATE;
  ELSIF p_escopo = 'vendedor' THEN
    SELECT COUNT(*) INTO v_count
    FROM caixas
    WHERE escopo = 'vendedor' 
      AND vendedor_id = p_vendedor_id 
      AND status = 'Aberto'
      AND data_abertura::date = CURRENT_DATE;
  ELSIF p_escopo = 'solo' THEN
    SELECT COUNT(*) INTO v_count
    FROM caixas
    WHERE escopo = 'solo' 
      AND user_id = p_user_id 
      AND status = 'Aberto'
      AND data_abertura::date = CURRENT_DATE;
  END IF;
  
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE solo_servicos IS 'Serviços prestados por usuários autônomos (modo Solo)';
COMMENT ON TABLE caixas IS 'Controle de caixa diário para Empresa, Vendedor e Solo';
COMMENT ON TABLE caixa_movimentacoes IS 'Movimentações (entradas/saídas) de cada caixa';

COMMENT ON COLUMN caixas.escopo IS 'Tipo de caixa: empresa, vendedor ou solo';
COMMENT ON COLUMN caixas.saldo_inicial IS 'Valor inicial ao abrir o caixa';
COMMENT ON COLUMN caixas.saldo_fechamento IS 'Valor contado fisicamente ao fechar';

COMMENT ON FUNCTION calcular_saldo_teorico IS 'Calcula saldo teórico: inicial + entradas - saídas';
COMMENT ON FUNCTION existe_caixa_aberto IS 'Verifica se já existe caixa aberto para o escopo';
