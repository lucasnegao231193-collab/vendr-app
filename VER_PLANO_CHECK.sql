-- Ver o check constraint da coluna plano
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.empresas'::regclass
  AND contype = 'c'
  AND conname LIKE '%plano%';
