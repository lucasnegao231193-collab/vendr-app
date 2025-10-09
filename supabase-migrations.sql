/**
 * MIGRAÇÕES VENDR - Melhorias v2
 * Execute no Supabase SQL Editor após o schema inicial
 */

-- ============================================================
-- 1) ADICIONAR PLANOS ÀS EMPRESAS
-- ============================================================
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS plano text 
  CHECK (plano IN ('plano1','plano2','plano3')) 
  NOT NULL DEFAULT 'plano1';

COMMENT ON COLUMN public.empresas.plano IS 'plano1=3 vendedores, plano2=5, plano3=10';

-- ============================================================
-- 1.5) ADICIONAR EMPRESA_ID EM KITS (NECESSÁRIO PARA RLS)
-- ============================================================
-- Adicionar coluna empresa_id na tabela kits
ALTER TABLE public.kits
  ADD COLUMN IF NOT EXISTS empresa_id uuid;

-- Preencher empresa_id com base no vendedor (se já houver dados)
UPDATE public.kits k
SET empresa_id = v.empresa_id
FROM public.vendedores v
WHERE k.vendedor_id = v.id
  AND k.empresa_id IS NULL;

-- Tornar empresa_id NOT NULL após preencher
ALTER TABLE public.kits
  ALTER COLUMN empresa_id SET NOT NULL;

-- Adicionar foreign key
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'kits_empresa_id_fkey'
  ) THEN
    ALTER TABLE public.kits
      ADD CONSTRAINT kits_empresa_id_fkey 
      FOREIGN KEY (empresa_id) 
      REFERENCES public.empresas(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

COMMENT ON COLUMN public.kits.empresa_id IS 'Empresa dona do kit (desnormalizado para RLS)';

-- ============================================================
-- 2) FUNÇÃO PARA OBTER LIMITE DE VENDEDORES POR PLANO
-- ============================================================
CREATE OR REPLACE FUNCTION public.vendedor_limit_for_plano(p text)
RETURNS int 
LANGUAGE sql 
IMMUTABLE 
AS $$
  SELECT CASE 
    WHEN p = 'plano1' THEN 3
    WHEN p = 'plano2' THEN 5
    WHEN p = 'plano3' THEN 10
    ELSE 3
  END
$$;

COMMENT ON FUNCTION public.vendedor_limit_for_plano IS 'Retorna limite de vendedores por plano';

-- ============================================================
-- 3) ADICIONAR MARCA AOS PRODUTOS
-- ============================================================
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS marca text;

COMMENT ON COLUMN public.produtos.marca IS 'Marca do produto (opcional)';

-- ============================================================
-- 4) MELHORIAS NA TABELA KITS (SAÍDA E ACEITE)
-- ============================================================
ALTER TABLE public.kits
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status text 
    CHECK (status IN ('pendente','aceito','recusado')) 
    DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

COMMENT ON COLUMN public.kits.assigned_at IS 'Data/hora que empresa atribuiu estoque';
COMMENT ON COLUMN public.kits.status IS 'pendente=aguardando aceite, aceito=vendedor confirmou, recusado=vendedor rejeitou';
COMMENT ON COLUMN public.kits.accepted_at IS 'Data/hora que vendedor aceitou estoque';

-- ============================================================
-- 5) ADICIONAR VALOR UNITÁRIO NO KIT_ITENS (SNAPSHOT DO PREÇO)
-- ============================================================
ALTER TABLE public.kit_itens
  ADD COLUMN IF NOT EXISTS valor_unit_atribuido numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.kit_itens.valor_unit_atribuido IS 'Preço do produto no momento da atribuição (snapshot histórico)';

-- ============================================================
-- 6) ADICIONAR ROLE AOS PERFIS (DIFERENCIAR OWNER DE SELLER)
-- ============================================================
-- Já existe, mas garantir valores corretos
ALTER TABLE public.perfis
  DROP CONSTRAINT IF EXISTS perfis_role_check;

ALTER TABLE public.perfis
  ADD CONSTRAINT perfis_role_check 
  CHECK (role IN ('owner', 'seller'));

COMMENT ON COLUMN public.perfis.role IS 'owner=dono da empresa (admin), seller=vendedor (funcionário)';

-- ============================================================
-- 7) FUNÇÃO HELPER: CONTAR VENDEDORES ATIVOS DA EMPRESA
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_vendedores_ativos(emp_id uuid)
RETURNS int
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::int
  FROM public.vendedores
  WHERE empresa_id = emp_id
    AND ativo = true
$$;

COMMENT ON FUNCTION public.count_vendedores_ativos IS 'Conta vendedores ativos de uma empresa';

-- ============================================================
-- 8) FUNÇÃO HELPER: VERIFICAR SE EMPRESA PODE CRIAR VENDEDOR
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_create_vendedor(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_plano text;
  v_limite int;
  v_atual int;
BEGIN
  -- Buscar plano da empresa
  SELECT plano INTO v_plano
  FROM public.empresas
  WHERE id = emp_id;
  
  IF v_plano IS NULL THEN
    RETURN false;
  END IF;
  
  -- Obter limite do plano
  v_limite := public.vendedor_limit_for_plano(v_plano);
  
  -- Contar vendedores ativos
  v_atual := public.count_vendedores_ativos(emp_id);
  
  -- Retornar se pode criar
  RETURN v_atual < v_limite;
END;
$$;

COMMENT ON FUNCTION public.can_create_vendedor IS 'Verifica se empresa atingiu limite de vendedores do plano';

-- ============================================================
-- 9) VIEW: RESUMO DE VENDEDORES POR EMPRESA
-- ============================================================
CREATE OR REPLACE VIEW public.v_empresas_vendedores_summary AS
SELECT 
  e.id as empresa_id,
  e.nome as empresa_nome,
  e.plano,
  public.vendedor_limit_for_plano(e.plano) as limite_vendedores,
  public.count_vendedores_ativos(e.id) as vendedores_ativos,
  (public.count_vendedores_ativos(e.id) < public.vendedor_limit_for_plano(e.plano)) as pode_criar_mais
FROM public.empresas e;

COMMENT ON VIEW public.v_empresas_vendedores_summary IS 'Resumo de uso de vendedores por empresa';

-- ============================================================
-- 10) ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_kits_status ON public.kits(status);
CREATE INDEX IF NOT EXISTS idx_kits_vendedor_data ON public.kits(vendedor_id, data);
CREATE INDEX IF NOT EXISTS idx_kits_empresa_status ON public.kits(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_produtos_marca ON public.produtos(marca) WHERE marca IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vendedores_empresa_ativo ON public.vendedores(empresa_id, ativo);

-- ============================================================
-- 11) ATUALIZAR RLS PARA KITS (PERMITIR SELLER VER/ATUALIZAR SEUS KITS)
-- ============================================================

-- Primeiro, garantir que kits já existentes tenham empresa_id
UPDATE public.kits k
SET empresa_id = v.empresa_id
FROM public.vendedores v
WHERE k.vendedor_id = v.id
  AND k.empresa_id IS NULL;

-- SELECT: vendedor pode ver seus próprios kits
DROP POLICY IF EXISTS "Vendedores veem seus kits" ON public.kits;
DROP POLICY IF EXISTS "Usuário vê kits da sua empresa" ON public.kits;

CREATE POLICY "Usuário vê kits da sua empresa"
ON public.kits
FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
);

-- INSERT: owner pode criar kits
DROP POLICY IF EXISTS "Owner pode inserir kits" ON public.kits;
CREATE POLICY "Owner pode inserir kits"
ON public.kits
FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- UPDATE: owner pode atualizar kits da empresa
DROP POLICY IF EXISTS "Owner pode atualizar kits" ON public.kits;
CREATE POLICY "Owner pode atualizar kits"
ON public.kits
FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
)
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
);

-- UPDATE: seller pode atualizar status dos seus kits (aceite/recusa)
DROP POLICY IF EXISTS "Seller pode aceitar/recusar seus kits" ON public.kits;
CREATE POLICY "Seller pode aceitar/recusar seus kits"
ON public.kits
FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'seller'
  AND status = 'pendente'
)
WITH CHECK (
  status IN ('aceito', 'recusado')
);

-- ============================================================
-- 12) TRIGGER: VALIDAR LIMITE DE VENDEDORES AO CRIAR
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_vendedor_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_pode_criar boolean;
BEGIN
  -- Verificar se empresa pode criar vendedor
  v_pode_criar := public.can_create_vendedor(NEW.empresa_id);
  
  IF NOT v_pode_criar THEN
    RAISE EXCEPTION 'Limite de vendedores atingido para o plano da empresa'
      USING HINT = 'Faça upgrade do plano para adicionar mais vendedores';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_vendedor_limit ON public.vendedores;
CREATE TRIGGER trg_validate_vendedor_limit
  BEFORE INSERT ON public.vendedores
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_vendedor_limit();

COMMENT ON TRIGGER trg_validate_vendedor_limit ON public.vendedores IS 'Bloqueia criação de vendedor se atingir limite do plano';

-- ============================================================
-- 13) VERIFICAÇÃO FINAL
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migrações aplicadas com sucesso!';
  RAISE NOTICE '📊 Planos configurados: plano1=3, plano2=5, plano3=10 vendedores';
  RAISE NOTICE '🔐 RLS atualizado para sellers';
  RAISE NOTICE '⚡ Índices criados para performance';
END $$;
