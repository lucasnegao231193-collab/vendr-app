-- Verificar perfis e empresas no banco
-- Execute este script no Supabase SQL Editor

-- 1. Contar perfis
SELECT COUNT(*) as total_perfis FROM perfis;

-- 2. Ver perfis com detalhes
SELECT 
  p.id,
  p.user_id,
  p.nome,
  p.role,
  p.empresa_id,
  e.nome as empresa_nome,
  e.is_solo
FROM perfis p
LEFT JOIN empresas e ON p.empresa_id = e.id
ORDER BY p.criado_em DESC;

-- 3. Contar por role
SELECT 
  role,
  COUNT(*) as quantidade
FROM perfis
GROUP BY role;

-- 4. Contar empresas
SELECT 
  is_solo,
  COUNT(*) as quantidade
FROM empresas
GROUP BY is_solo;

-- 5. Ver se há RLS bloqueando
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('perfis', 'empresas');

-- 6. Ver políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('perfis', 'empresas');
