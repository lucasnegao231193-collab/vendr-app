-- Verificar estabelecimentos no catálogo
-- Execute este script no Supabase SQL Editor para diagnosticar

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'catalogo_estabelecimentos'
) as tabela_existe;

-- 2. Contar total de estabelecimentos
SELECT COUNT(*) as total_estabelecimentos 
FROM catalogo_estabelecimentos;

-- 3. Contar por status de aprovação
SELECT 
  aprovado,
  COUNT(*) as quantidade
FROM catalogo_estabelecimentos
GROUP BY aprovado;

-- 4. Ver últimos estabelecimentos cadastrados
SELECT 
  id,
  nome,
  aprovado,
  destaque,
  criado_em
FROM catalogo_estabelecimentos
ORDER BY criado_em DESC
LIMIT 10;

-- 5. Ver estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'catalogo_estabelecimentos'
ORDER BY ordinal_position;
