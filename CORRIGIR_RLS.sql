-- ============================================================
-- CORRIGIR RLS POLICIES - Execute no Supabase SQL Editor
-- ============================================================

-- 1) Dropar policies antigas
DROP POLICY IF EXISTS "temp_allow_all_transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "temp_allow_all_itens" ON public.transferencia_itens;
DROP POLICY IF EXISTS "temp_allow_all_vendedor_estoque" ON public.vendedor_estoque;

-- 2) Criar funções helper (se não existirem)
CREATE OR REPLACE FUNCTION public.empresa_id_for_user(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT empresa_id FROM public.perfis 
    WHERE user_id = empresa_id_for_user.user_id 
    LIMIT 1
  );
END;
$$;

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

-- 3) RLS para TRANSFERENCIAS
CREATE POLICY "Empresa e vendedor veem suas transferencias"
ON public.transferencias
FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

CREATE POLICY "Empresa pode criar transferencias"
ON public.transferencias
FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
);

CREATE POLICY "Empresa e vendedor podem atualizar transferencias"
ON public.transferencias
FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

-- 4) RLS para TRANSFERENCIA_ITENS
CREATE POLICY "Ver itens de transferencias acessiveis"
ON public.transferencia_itens
FOR SELECT
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

CREATE POLICY "Empresa pode gerenciar itens"
ON public.transferencia_itens
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.transferencias t
    WHERE t.id = transferencia_itens.transferencia_id
      AND t.empresa_id = public.empresa_id_for_user(auth.uid())
  )
);

-- 5) RLS para VENDEDOR_ESTOQUE
CREATE POLICY "Vendedor e empresa veem estoque"
ON public.vendedor_estoque
FOR SELECT
TO authenticated
USING (
  vendedor_id = public.vendedor_id_for_user(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.vendedores v
    WHERE v.id = vendedor_estoque.vendedor_id
      AND v.empresa_id = public.empresa_id_for_user(auth.uid())
  )
);

CREATE POLICY "Sistema pode gerenciar estoque vendedor"
ON public.vendedor_estoque
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- PRONTO! Agora recarregue: http://localhost:3000/empresa/transferencias
-- ============================================================
