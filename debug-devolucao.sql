-- ============================================================
-- SCRIPT DE DEBUG - VERIFICAR DEVOLUÇÕES E ESTOQUE
-- ============================================================

-- 1. Ver todas as devoluções e seus status
SELECT 
  d.id,
  d.status,
  d.created_at,
  v.nome as vendedor,
  d.total_itens,
  d.observacao
FROM devolucoes d
JOIN vendedores v ON v.id = d.vendedor_id
ORDER BY d.created_at DESC
LIMIT 5;

-- 2. Ver itens da última devolução aceita
SELECT 
  di.id,
  p.nome as produto,
  di.quantidade,
  d.status as status_devolucao
FROM devolucao_itens di
JOIN devolucoes d ON d.id = di.devolucao_id
JOIN produtos p ON p.id = di.produto_id
WHERE d.status = 'aceita'
ORDER BY d.created_at DESC
LIMIT 10;

-- 3. Ver estoque atual da empresa
SELECT 
  e.id,
  p.nome as produto,
  e.qtd as quantidade_estoque,
  e.updated_at as ultima_atualizacao
FROM estoques e
JOIN produtos p ON p.id = e.produto_id
ORDER BY e.updated_at DESC;

-- 4. Ver movimentações recentes de estoque
SELECT 
  em.id,
  em.tipo,
  p.nome as produto,
  em.qtd as quantidade,
  em.motivo,
  em.created_at
FROM estoque_movs em
JOIN produtos p ON p.id = em.produto_id
ORDER BY em.created_at DESC
LIMIT 10;

-- 5. Ver logs de devolução
SELECT 
  el.tipo,
  el.quantidade,
  el.observacao,
  el.created_at,
  v.nome as vendedor
FROM estoque_logs el
LEFT JOIN vendedores v ON v.id = el.vendedor_id
WHERE el.tipo IN ('devolucao_solicitada', 'aceite_devolucao', 'recusa_devolucao')
ORDER BY el.created_at DESC
LIMIT 10;

-- ============================================================
-- TESTE MANUAL DE INSERT/UPDATE NO ESTOQUE
-- ============================================================

-- Primeiro, pegue os IDs necessários:
SELECT 'Sua empresa_id:' as info, id FROM empresas LIMIT 1;
SELECT 'Um produto_id:' as info, id, nome FROM produtos LIMIT 1;

-- Depois, teste inserir/atualizar manualmente (substitua os IDs):
/*
-- Teste 1: Inserir novo registro
INSERT INTO estoques (empresa_id, produto_id, qtd)
VALUES (
  'COLE_SEU_EMPRESA_ID_AQUI',
  'COLE_SEU_PRODUTO_ID_AQUI',
  999
)
ON CONFLICT (empresa_id, produto_id) 
DO UPDATE SET qtd = estoques.qtd + 999;

-- Teste 2: Verificar se foi inserido
SELECT * FROM estoques 
WHERE empresa_id = 'COLE_SEU_EMPRESA_ID_AQUI'
  AND produto_id = 'COLE_SEU_PRODUTO_ID_AQUI';
*/
