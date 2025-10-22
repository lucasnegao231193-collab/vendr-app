# 🔍 DIAGNÓSTICO - Catálogo Não Aparece Estabelecimentos

## ✅ Logs Adicionados

Adicionei logs detalhados na API `/api/admin/catalogo` para diagnosticar o problema.

---

## 🧪 TESTE AGORA - Passo a Passo

### 1️⃣ Recarregar a Página
1. Vá para: `http://localhost:3000/admin/catalogo`
2. Abra o **Console do Navegador** (F12)
3. Recarregue a página (F5)

### 2️⃣ Verificar Logs no Console (F12)

Você deve ver:
```
🔍 Carregando estabelecimentos com filtro: pendentes
📡 Response status: 200
✅ Estabelecimentos carregados: X itens
📊 Dados: [...]
```

### 3️⃣ Verificar Logs no Terminal (onde roda npm run dev)

Você deve ver:
```
🏪 API /admin/catalogo - Iniciando...
✅ Usuário autenticado: ...
✅ Admin verificado
🔍 Filtro aplicado: pendentes
📋 Buscando estabelecimentos PENDENTES (aprovado = false)
📊 Resultado da query: { total: X, erro: null, dados: [...] }
```

---

## 🔍 Possíveis Causas

### Causa 1: Não Há Estabelecimentos Cadastrados ❌

**Sintoma**: Logs mostram `total: 0`

**Solução**: Cadastre um estabelecimento primeiro!

**Como cadastrar**:
1. Faça login como usuário normal (não admin)
2. Vá para a página de catálogo do app
3. Clique em "Adicionar Estabelecimento"
4. Preencha os dados e envie

### Causa 2: Estabelecimentos Estão Aprovados ✅

**Sintoma**: Filtro "Pendentes" mostra 0, mas "Todos" mostra itens

**Solução**: Clique no botão **"Todos"** ou **"Aprovados"** para ver

**Por que isso acontece**:
- Quando você cadastra um estabelecimento, ele pode já estar aprovado (`aprovado = true`)
- O filtro padrão é "Pendentes" (`aprovado = false`)
- Troque o filtro para ver os estabelecimentos

### Causa 3: Tabela Não Existe ⚠️

**Sintoma**: Erro no terminal sobre tabela não encontrada

**Solução**: Execute a migration que cria a tabela

```sql
-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'catalogo_estabelecimentos'
);
```

### Causa 4: Problema de RLS (Row Level Security) 🔒

**Sintoma**: Query retorna vazio mesmo tendo dados

**Solução**: Verificar políticas RLS da tabela

```sql
-- Ver políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'catalogo_estabelecimentos';
```

---

## 📊 Verificar Banco de Dados

Execute no **Supabase SQL Editor**:

### 1. Verificar se há estabelecimentos
```sql
SELECT COUNT(*) as total FROM catalogo_estabelecimentos;
```

### 2. Ver estabelecimentos por status
```sql
SELECT 
  aprovado,
  COUNT(*) as quantidade
FROM catalogo_estabelecimentos
GROUP BY aprovado;
```

**Resultado esperado**:
```
aprovado | quantidade
---------|------------
false    | 2          <- Pendentes
true     | 5          <- Aprovados
```

### 3. Ver últimos estabelecimentos
```sql
SELECT 
  id,
  nome,
  aprovado,
  destaque,
  criado_em
FROM catalogo_estabelecimentos
ORDER BY criado_em DESC
LIMIT 5;
```

### 4. Ver TODOS os dados de um estabelecimento
```sql
SELECT * FROM catalogo_estabelecimentos LIMIT 1;
```

---

## 🛠️ Soluções Rápidas

### Solução 1: Mudar Filtro
Na página `/admin/catalogo`, clique nos botões:
- **Pendentes** - Mostra `aprovado = false`
- **Aprovados** - Mostra `aprovado = true`
- **Todos** - Mostra todos

### Solução 2: Criar Estabelecimento de Teste

Execute no **Supabase SQL Editor**:

```sql
-- Criar estabelecimento de teste PENDENTE
INSERT INTO catalogo_estabelecimentos (
  nome,
  descricao,
  categoria,
  endereco,
  cidade,
  estado,
  cep,
  telefone,
  aprovado,
  destaque
) VALUES (
  'Estabelecimento Teste',
  'Descrição do estabelecimento de teste',
  'Restaurante',
  'Rua Teste, 123',
  'São Paulo',
  'SP',
  '01234-567',
  '(11) 98765-4321',
  false,  -- PENDENTE de aprovação
  false
);
```

Depois, recarregue a página do catálogo!

### Solução 3: Aprovar Todos os Estabelecimentos

Se você quer ver estabelecimentos que já existem mas estão aprovados:

```sql
-- Ver quantos estão aprovados
SELECT COUNT(*) FROM catalogo_estabelecimentos WHERE aprovado = true;

-- Mudar um para pendente (para teste)
UPDATE catalogo_estabelecimentos 
SET aprovado = false 
WHERE id = (SELECT id FROM catalogo_estabelecimentos LIMIT 1);
```

---

## 📋 Checklist de Diagnóstico

Execute este checklist e me envie os resultados:

- [ ] **Logs do Console (F12)**: Quantos estabelecimentos carregados?
- [ ] **Logs do Terminal**: O que aparece na query?
- [ ] **SQL**: Quantos estabelecimentos existem no banco?
- [ ] **SQL**: Quantos estão com `aprovado = false`?
- [ ] **SQL**: Quantos estão com `aprovado = true`?
- [ ] **Página**: Testou clicar em "Todos" e "Aprovados"?

---

## 🎯 Me Envie

Para eu te ajudar melhor, me envie:

1. **Print dos logs do Console** (F12)
2. **Print dos logs do Terminal** (npm run dev)
3. **Resultado desta query**:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE aprovado = false) as pendentes,
  COUNT(*) FILTER (WHERE aprovado = true) as aprovados
FROM catalogo_estabelecimentos;
```

---

## 💡 Dica Rápida

**99% das vezes o problema é**:
- Não há estabelecimentos cadastrados OU
- Os estabelecimentos estão aprovados e você está no filtro "Pendentes"

**Solução**: Clique no botão **"Todos"** para ver! 🎯
