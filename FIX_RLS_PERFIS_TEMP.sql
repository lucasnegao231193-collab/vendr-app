-- ============================================================
-- FIX: Policy temporária permissiva para perfis
-- ============================================================

-- 1) Habilitar RLS (se não estiver)
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- 2) Dropar policies antigas
DROP POLICY IF EXISTS "temp_allow_all_perfis" ON public.perfis;
DROP POLICY IF EXISTS "Usuarios podem criar seus perfis" ON public.perfis;
DROP POLICY IF EXISTS "Usuarios veem seus perfis" ON public.perfis;
DROP POLICY IF EXISTS "Usuarios podem atualizar seus perfis" ON public.perfis;
DROP POLICY IF EXISTS "Usuário pode entrar seu perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuário vê apenas seu perfil" ON public.perfis;

-- 3) Criar policy temporária super permissiva
CREATE POLICY "temp_allow_all_perfis"
ON public.perfis
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4) Verificar
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'perfis'
ORDER BY policyname;
