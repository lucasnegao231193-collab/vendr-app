-- ============================================================
-- RECRIAR POLICIES - Remove antigas e adiciona novas
-- ============================================================

-- 1) DROPAR TODAS AS POLICIES DAS TRANSFERÊNCIAS
DROP POLICY IF EXISTS "temp_allow_all_transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "temp_allow_all_itens" ON public.transferencia_itens;
DROP POLICY IF EXISTS "temp_allow_all_vendedor_estoque" ON public.vendedor_estoque;

DROP POLICY IF EXISTS "Usuários veem transferências da empresa ou vendedor" ON public.transferencias;
DROP POLICY IF EXISTS "Empresa pode criar transferências" ON public.transferencias;
DROP POLICY IF EXISTS "Empresa pode atualizar transferências" ON public.transferencias;
DROP POLICY IF EXISTS "Empresa e vendedor veem suas transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Empresa pode criar transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Empresa e vendedor podem atualizar transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Empresa pode deletar transferencias" ON public.transferencias;

DROP POLICY IF EXISTS "Usuários veem itens de transferências acessíveis" ON public.transferencia_itens;
DROP POLICY IF EXISTS "Sistema pode gerenciar itens" ON public.transferencia_itens;
DROP POLICY IF EXISTS "Ver itens de transferencias acessiveis" ON public.transferencia_itens;
DROP POLICY IF EXISTS "Empresa pode gerenciar itens" ON public.transferencia_itens;

DROP POLICY IF EXISTS "Vendedor vê apenas seu estoque" ON public.vendedor_estoque;
DROP POLICY IF EXISTS "Sistema pode inserir/atualizar estoque vendedor" ON public.vendedor_estoque;
DROP POLICY IF EXISTS "Vendedor e empresa veem estoque" ON public.vendedor_estoque;
DROP POLICY IF EXISTS "Sistema pode gerenciar estoque vendedor" ON public.vendedor_estoque;

-- 2) RECRIAR POLICIES PARA TRANSFERENCIAS
CREATE POLICY "Empresa e vendedor veem transferencias"
ON public.transferencias
FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

CREATE POLICY "Empresa cria transferencias"
ON public.transferencias
FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
);

CREATE POLICY "Empresa e vendedor atualizam transferencias"
ON public.transferencias
FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

CREATE POLICY "Empresa deleta transferencias"
ON public.transferencias
FOR DELETE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
);

-- 3) RECRIAR POLICIES PARA TRANSFERENCIA_ITENS
CREATE POLICY "Ver itens acessiveis"
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

CREATE POLICY "Empresa gerencia itens"
ON public.transferencia_itens
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.transferencias t
    WHERE t.id = transferencia_itens.transferencia_id
      AND t.empresa_id = public.empresa_id_for_user(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.transferencias t
    WHERE t.id = transferencia_itens.transferencia_id
      AND t.empresa_id = public.empresa_id_for_user(auth.uid())
  )
);

-- 4) RECRIAR POLICIES PARA VENDEDOR_ESTOQUE
CREATE POLICY "Ver estoque"
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

CREATE POLICY "Gerenciar estoque"
ON public.vendedor_estoque
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- PRONTO! Policies recriadas com nomes únicos
-- ============================================================
