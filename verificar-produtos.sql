-- Verificar produtos da empresa
SELECT 
  id,
  nome,
  empresa_id,
  preco,
  unidade
FROM produtos
WHERE empresa_id = '50838d8d-cd01-45d5-a9d8-6d91ab477e8d'
ORDER BY nome;

-- Verificar se existe Coca Cola (sem filtro de empresa)
SELECT 
  id,
  nome,
  empresa_id,
  preco,
  unidade
FROM produtos
WHERE nome ILIKE '%coca%'
LIMIT 5;

-- Verificar estoque do vendedor (Beatriz)
SELECT 
  ve.id,
  ve.vendedor_id,
  ve.produto_id,
  ve.quantidade,
  p.nome as produto_nome,
  v.nome as vendedor_nome
FROM vendedor_estoque ve
JOIN produtos p ON p.id = ve.produto_id
JOIN vendedores v ON v.id = ve.vendedor_id
WHERE v.nome ILIKE '%beatriz%'
ORDER BY ve.quantidade DESC;
