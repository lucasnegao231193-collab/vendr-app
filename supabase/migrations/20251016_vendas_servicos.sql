-- =====================================================
-- MIGRATION: Vendas de Serviços (Solo)
-- Data: 16/10/2025
-- Descrição: Permite registrar vendas de serviços prestados
-- =====================================================

-- =====================================================
-- 1. AJUSTAR TABELA solo_servicos
-- =====================================================
-- Renomear para solo_servicos_catalogo (catálogo de serviços oferecidos)
-- Remover campos de venda específica (status, data, quantidade)

ALTER TABLE solo_servicos RENAME TO solo_servicos_catalogo;

-- Remover colunas que não fazem sentido no catálogo
ALTER TABLE solo_servicos_catalogo DROP COLUMN IF EXISTS quantidade;
ALTER TABLE solo_servicos_catalogo DROP COLUMN IF EXISTS status;
ALTER TABLE solo_servicos_catalogo DROP COLUMN IF EXISTS data;
ALTER TABLE solo_servicos_catalogo DROP COLUMN IF EXISTS observacoes;

-- Adicionar campo ativo
ALTER TABLE solo_servicos_catalogo ADD COLUMN ativo BOOLEAN DEFAULT true;

-- Atualizar comentário
COMMENT ON TABLE solo_servicos_catalogo IS 'Catálogo de serviços oferecidos pelo autônomo (tipos de serviço)';

-- =====================================================
-- 2. CRIAR TABELA vendas_servicos
-- =====================================================
CREATE TABLE IF NOT EXISTS vendas_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES solo_servicos_catalogo(id) ON DELETE RESTRICT,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  valor_unitario NUMERIC(10, 2) NOT NULL CHECK (valor_unitario >= 0),
  valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total >= 0),
  metodo_pagamento TEXT NOT NULL CHECK (metodo_pagamento IN ('Dinheiro', 'PIX', 'Debito', 'Credito', 'Outros')),
  status TEXT NOT NULL DEFAULT 'Concluído' CHECK (status IN ('Pendente', 'Concluído', 'Cancelado')),
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para vendas_servicos
CREATE INDEX idx_vendas_servicos_user_id ON vendas_servicos(user_id);
CREATE INDEX idx_vendas_servicos_servico_id ON vendas_servicos(servico_id);
CREATE INDEX idx_vendas_servicos_data ON vendas_servicos(data_venda);
CREATE INDEX idx_vendas_servicos_status ON vendas_servicos(status);
CREATE INDEX idx_vendas_servicos_metodo ON vendas_servicos(metodo_pagamento);

-- RLS para vendas_servicos
ALTER TABLE vendas_servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias vendas de serviços"
  ON vendas_servicos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias vendas de serviços"
  ON vendas_servicos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias vendas de serviços"
  ON vendas_servicos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias vendas de serviços"
  ON vendas_servicos FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_vendas_servicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendas_servicos_updated_at
  BEFORE UPDATE ON vendas_servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_vendas_servicos_updated_at();

-- =====================================================
-- 3. FUNÇÃO PARA CALCULAR ESTATÍSTICAS DE SERVIÇOS
-- =====================================================
CREATE OR REPLACE FUNCTION get_servicos_stats(p_user_id UUID)
RETURNS TABLE (
  total_vendas BIGINT,
  faturamento_total NUMERIC,
  servico_mais_vendido TEXT,
  total_mes_atual NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_vendas,
    COALESCE(SUM(valor_total), 0) as faturamento_total,
    (
      SELECT s.nome 
      FROM vendas_servicos vs
      JOIN solo_servicos_catalogo s ON s.id = vs.servico_id
      WHERE vs.user_id = p_user_id AND vs.status = 'Concluído'
      GROUP BY s.nome
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as servico_mais_vendido,
    COALESCE(
      (
        SELECT SUM(valor_total)
        FROM vendas_servicos
        WHERE user_id = p_user_id 
          AND status = 'Concluído'
          AND EXTRACT(MONTH FROM data_venda) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM data_venda) = EXTRACT(YEAR FROM CURRENT_DATE)
      ), 0
    ) as total_mes_atual
  FROM vendas_servicos
  WHERE user_id = p_user_id AND status = 'Concluído';
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 4. ATUALIZAR REFERÊNCIAS EM caixa_movimentacoes
-- =====================================================
-- A coluna solo_servico_id agora referencia vendas_servicos
ALTER TABLE caixa_movimentacoes 
  DROP CONSTRAINT IF EXISTS caixa_movimentacoes_solo_servico_id_fkey;

ALTER TABLE caixa_movimentacoes 
  RENAME COLUMN solo_servico_id TO venda_servico_id;

ALTER TABLE caixa_movimentacoes 
  ADD CONSTRAINT caixa_movimentacoes_venda_servico_id_fkey 
  FOREIGN KEY (venda_servico_id) 
  REFERENCES vendas_servicos(id) 
  ON DELETE SET NULL;

-- Atualizar índice
DROP INDEX IF EXISTS idx_caixa_mov_servico_id;
CREATE INDEX idx_caixa_mov_venda_servico_id ON caixa_movimentacoes(venda_servico_id);

-- =====================================================
-- 5. COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE vendas_servicos IS 'Registro de vendas de serviços prestados';
COMMENT ON COLUMN vendas_servicos.servico_id IS 'Referência ao serviço do catálogo';
COMMENT ON COLUMN vendas_servicos.valor_total IS 'Valor total = quantidade * valor_unitario';
COMMENT ON FUNCTION get_servicos_stats IS 'Retorna estatísticas de vendas de serviços';
