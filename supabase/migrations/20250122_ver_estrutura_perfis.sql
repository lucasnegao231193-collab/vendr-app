-- Ver estrutura da tabela perfis
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'perfis'
ORDER BY ordinal_position;
