-- Ver todas as colunas da tabela perfis
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'perfis'
ORDER BY ordinal_position;
