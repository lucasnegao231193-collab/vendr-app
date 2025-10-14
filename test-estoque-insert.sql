-- ============================================================
-- TESTE MANUAL: INSERIR PRODUTO NO ESTOQUE DA EMPRESA
-- ============================================================

-- Passo 1: Buscar IDs necessários
SELECT 'EMPRESA ID:' as label, id, nome FROM empresas LIMIT 1;
SELECT 'PRODUTO COCA COLA ID:' as label, id, nome FROM produtos WHERE nome LIKE '%Coca%' LIMIT 1;

-- Passo 2: Inserir manualmente no estoque (COPIE OS IDs ACIMA)
-- Substitua os valores abaixo pelos IDs reais

INSERT INTO estoques (empresa_id, produto_id, qtd)
VALUES (
  '50838d8d-cd01-45d5-a9d8-6d91ab477e8d',  -- empresa_id
  (SELECT id FROM produtos WHERE nome LIKE '%Coca%' LIMIT 1),  -- produto_id
  6  -- quantidade
)
ON CONFLICT (empresa_id, produto_id) 
DO UPDATE SET 
  qtd = estoques.qtd + 6,
  updated_at = now();

-- Passo 3: Verificar se foi inserido
SELECT 
  p.nome as produto,
  e.qtd as quantidade,
  e.created_at,
  e.updated_at
FROM estoques e
JOIN produtos p ON p.id = e.produto_id
WHERE e.empresa_id = '50838d8d-cd01-45d5-a9d8-6d91ab477e8d';

-- Passo 4: Inserir movimento manualmente
INSERT INTO estoque_movs (empresa_id, produto_id, tipo, qtd, motivo, user_id)
VALUES (
  '50838d8d-cd01-45d5-a9d8-6d91ab477e8d',
  (SELECT id FROM produtos WHERE nome LIKE '%Coca%' LIMIT 1),
  'entrada',
  6,
  'Teste manual de devolução',
  (SELECT user_id FROM perfis WHERE empresa_id = '50838d8d-cd01-45d5-a9d8-6d91ab477e8d' AND role = 'owner' LIMIT 1)
);

-- Passo 5: Verificar movimentações
SELECT 
  em.tipo,
  p.nome as produto,
  em.qtd,
  em.motivo,
  em.created_at
FROM estoque_movs em
JOIN produtos p ON p.id = em.produto_id
WHERE em.empresa_id = '50838d8d-cd01-45d5-a9d8-6d91ab477e8d'
ORDER BY em.created_at DESC
LIMIT 5;
