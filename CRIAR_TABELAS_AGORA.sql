-- ============================================================
-- COPIE E COLE ESTE SQL NO SUPABASE AGORA!
-- ============================================================

-- 1) CRIAR TABELAS
CREATE TABLE IF NOT EXISTS public.transferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id),
  criado_por uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'aguardando_aceite',
  total_itens int NOT NULL DEFAULT 0,
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transferencia_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transferencia_id uuid NOT NULL REFERENCES public.transferencias(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id),
  quantidade int NOT NULL,
  preco_unit numeric(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendedor_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id),
  quantidade int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendedor_id, produto_id)
);

-- 2) ÍNDICES
CREATE INDEX IF NOT EXISTS idx_transferencias_empresa ON public.transferencias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_vendedor ON public.transferencias(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_transferencia_itens_transferencia ON public.transferencia_itens(transferencia_id);

-- 3) RLS (Row Level Security)
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencia_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedor_estoque ENABLE ROW LEVEL SECURITY;

-- 4) POLICIES TEMPORÁRIAS (permitir tudo por enquanto)
DROP POLICY IF EXISTS "temp_allow_all_transferencias" ON public.transferencias;
CREATE POLICY "temp_allow_all_transferencias" 
ON public.transferencias 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "temp_allow_all_itens" ON public.transferencia_itens;
CREATE POLICY "temp_allow_all_itens" 
ON public.transferencia_itens 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "temp_allow_all_vendedor_estoque" ON public.vendedor_estoque;
CREATE POLICY "temp_allow_all_vendedor_estoque" 
ON public.vendedor_estoque 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================================
-- PRONTO! Agora teste: http://localhost:3000/empresa/transferencias
-- ============================================================
