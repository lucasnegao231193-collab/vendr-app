-- ============================================
-- VENDR SOLO - Migração Completa
-- Modo Autônomo (one-person business)
-- ============================================

-- 1. Adicionar colunas para modo Solo na tabela empresas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS is_solo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plano TEXT CHECK (plano IN ('solo_free','solo_pro','plano1','plano2','plano3')) DEFAULT 'plano1';

-- 2. Criar tabela de controle de cotas mensais (Solo)
CREATE TABLE IF NOT EXISTS public.solo_cotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  ano_mes CHAR(7) NOT NULL, -- Formato: 'YYYY-MM'
  vendas_mes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, ano_mes)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_solo_cotas_empresa_mes ON public.solo_cotas(empresa_id, ano_mes);
CREATE INDEX IF NOT EXISTS idx_empresas_is_solo ON public.empresas(is_solo);
CREATE INDEX IF NOT EXISTS idx_empresas_plano ON public.empresas(plano);

-- 4. Habilitar RLS na tabela solo_cotas
ALTER TABLE public.solo_cotas ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para solo_cotas
-- (Remover políticas existentes se houver)
DROP POLICY IF EXISTS "Users can view their own quota" ON public.solo_cotas;
DROP POLICY IF EXISTS "Users can insert their own quota" ON public.solo_cotas;
DROP POLICY IF EXISTS "Users can update their own quota" ON public.solo_cotas;

CREATE POLICY "Users can view their own quota"
  ON public.solo_cotas
  FOR SELECT
  USING (empresa_id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own quota"
  ON public.solo_cotas
  FOR INSERT
  WITH CHECK (empresa_id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own quota"
  ON public.solo_cotas
  FOR UPDATE
  USING (empresa_id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid()
  ));

-- 6. Criar função helper para obter cota do mês atual
CREATE OR REPLACE FUNCTION public.get_solo_cota_atual(p_empresa_id UUID)
RETURNS TABLE (
  ano_mes TEXT,
  vendas_mes INT,
  limite INT,
  plano TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ano_mes TEXT;
  v_plano TEXT;
BEGIN
  -- Obter ano_mes atual
  v_ano_mes := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Obter plano da empresa
  SELECT e.plano INTO v_plano
  FROM public.empresas e
  WHERE e.id = p_empresa_id;
  
  -- Retornar dados da cota
  RETURN QUERY
  SELECT 
    sc.ano_mes,
    COALESCE(sc.vendas_mes, 0) as vendas_mes,
    CASE WHEN v_plano = 'solo_free' THEN 30 ELSE 999999 END as limite,
    v_plano as plano
  FROM public.solo_cotas sc
  WHERE sc.empresa_id = p_empresa_id AND sc.ano_mes = v_ano_mes
  UNION ALL
  SELECT 
    v_ano_mes as ano_mes,
    0 as vendas_mes,
    CASE WHEN v_plano = 'solo_free' THEN 30 ELSE 999999 END as limite,
    v_plano as plano
  WHERE NOT EXISTS (
    SELECT 1 FROM public.solo_cotas 
    WHERE empresa_id = p_empresa_id AND ano_mes = v_ano_mes
  )
  LIMIT 1;
END;
$$;

-- 7. Criar função para incrementar cota de vendas
CREATE OR REPLACE FUNCTION public.increment_solo_cota(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ano_mes TEXT;
  v_plano TEXT;
  v_vendas_mes INT;
BEGIN
  -- Obter ano_mes atual
  v_ano_mes := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Obter plano da empresa
  SELECT plano INTO v_plano
  FROM public.empresas
  WHERE id = p_empresa_id;
  
  -- Se for solo_free, verificar limite
  IF v_plano = 'solo_free' THEN
    SELECT COALESCE(vendas_mes, 0) INTO v_vendas_mes
    FROM public.solo_cotas
    WHERE empresa_id = p_empresa_id AND ano_mes = v_ano_mes;
    
    -- Bloquear se atingiu limite
    IF v_vendas_mes >= 30 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Inserir ou atualizar cota
  INSERT INTO public.solo_cotas (empresa_id, ano_mes, vendas_mes)
  VALUES (p_empresa_id, v_ano_mes, 1)
  ON CONFLICT (empresa_id, ano_mes)
  DO UPDATE SET 
    vendas_mes = public.solo_cotas.vendas_mes + 1,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$;

-- 8. Criar view para limites Solo
CREATE OR REPLACE VIEW public.vw_solo_limites AS
SELECT 
  e.id as empresa_id,
  e.nome as empresa_nome,
  e.is_solo,
  e.plano,
  TO_CHAR(NOW(), 'YYYY-MM') as ano_mes_atual,
  COALESCE(sc.vendas_mes, 0) as vendas_mes,
  CASE 
    WHEN e.plano = 'solo_free' THEN 30
    ELSE 999999
  END as limite_vendas,
  CASE 
    WHEN e.plano = 'solo_free' THEN COALESCE(sc.vendas_mes, 0) >= 30
    ELSE FALSE
  END as limite_atingido
FROM public.empresas e
LEFT JOIN public.solo_cotas sc ON sc.empresa_id = e.id 
  AND sc.ano_mes = TO_CHAR(NOW(), 'YYYY-MM')
WHERE e.is_solo = true;

-- 9. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_solo_cotas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_solo_cotas_updated_at
  BEFORE UPDATE ON public.solo_cotas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solo_cotas_updated_at();

-- 10. Comentários nas tabelas
COMMENT ON TABLE public.solo_cotas IS 'Controle de cotas mensais para usuários Solo';
COMMENT ON COLUMN public.empresas.is_solo IS 'Flag indicando se é uma empresa solo (autônomo)';
COMMENT ON COLUMN public.empresas.plano IS 'Plano da empresa: solo_free, solo_pro, plano1, plano2, plano3';
COMMENT ON COLUMN public.solo_cotas.ano_mes IS 'Ano e mês no formato YYYY-MM';
COMMENT ON COLUMN public.solo_cotas.vendas_mes IS 'Quantidade de vendas registradas no mês';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
