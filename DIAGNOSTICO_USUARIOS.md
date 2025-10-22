# 🔍 DIAGNÓSTICO - Usuários Não Aparecem

## 🎯 Problema

As estatísticas de **Empresas**, **Autônomos** e **Vendedores** estão em **0**.

## 🔍 Possíveis Causas

### Causa 1: Não Há Perfis Cadastrados ❌

Apenas admins foram criados, mas nenhum usuário normal (empresa/autônomo) foi cadastrado.

**Verificar**: Execute no **Supabase SQL Editor**:

```sql
-- Ver quantos perfis existem
SELECT COUNT(*) as total FROM perfis;

-- Ver perfis com empresas
SELECT 
  p.nome,
  p.role,
  e.nome as empresa,
  e.is_solo
FROM perfis p
LEFT JOIN empresas e ON p.empresa_id = e.id;
```

**Se retornar 0**: Não há perfis! Você precisa cadastrar usuários.

---

### Causa 2: RLS Bloqueando Perfis 🔒

Row Level Security pode estar bloqueando a visualização dos perfis para admins.

**Verificar**: Execute no **Supabase SQL Editor**:

```sql
-- Ver se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('perfis', 'empresas');

-- Ver políticas
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('perfis', 'empresas');
```

**Solução Temporária**:
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
```

Depois recarregue a página `/admin/usuarios`.

---

### Causa 3: Join Incorreto na Query 🔗

A query pode não estar fazendo o join corretamente.

**Teste Manual**: Execute no **Supabase SQL Editor**:

```sql
-- Testar query manualmente
SELECT 
  p.id,
  p.user_id,
  p.nome,
  p.role,
  p.empresa_id,
  e.id as empresa_id_join,
  e.nome as empresa_nome,
  e.is_solo
FROM perfis p
INNER JOIN empresas e ON p.empresa_id = e.id;
```

**Se retornar vazio**: O problema é o INNER JOIN. Alguns perfis podem não ter `empresa_id`.

**Solução**: Usar LEFT JOIN:
```sql
SELECT 
  p.id,
  p.user_id,
  p.nome,
  p.role,
  e.nome as empresa_nome,
  e.is_solo
FROM perfis p
LEFT JOIN empresas e ON p.empresa_id = e.id;
```

---

## 🧪 TESTE RÁPIDO

### 1️⃣ Verificar se Há Perfis

Execute no **Supabase SQL Editor**:

```sql
SELECT COUNT(*) as total FROM perfis;
```

**Resultado esperado**: Número > 0

**Se for 0**: Você precisa cadastrar usuários primeiro!

---

### 2️⃣ Cadastrar Usuário de Teste

Se não houver perfis, cadastre um usuário de teste:

1. Vá para `/login`
2. Clique em "Criar conta"
3. Preencha os dados
4. Complete o onboarding:
   - Escolha "Empresa" ou "Autônomo"
   - Preencha os dados da empresa

Depois volte para `/admin/usuarios` e veja se aparece!

---

### 3️⃣ Desabilitar RLS (Teste)

Se houver perfis mas não aparecem, desabilite RLS:

```sql
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
```

Recarregue `/admin/usuarios`.

**Se funcionar**: O problema é RLS! Vou criar políticas corretas.

---

## 📊 Script Completo de Diagnóstico

Execute no **Supabase SQL Editor**:

```sql
-- 1. Contar perfis
SELECT 'Total de perfis:' as info, COUNT(*) as valor FROM perfis
UNION ALL
SELECT 'Total de empresas:', COUNT(*) FROM empresas
UNION ALL
SELECT 'Perfis owner:', COUNT(*) FROM perfis WHERE role = 'owner'
UNION ALL
SELECT 'Perfis seller:', COUNT(*) FROM perfis WHERE role = 'seller'
UNION ALL
SELECT 'Empresas solo:', COUNT(*) FROM empresas WHERE is_solo = true
UNION ALL
SELECT 'Empresas normais:', COUNT(*) FROM empresas WHERE is_solo = false;

-- 2. Ver perfis com empresas
SELECT 
  p.id,
  p.nome as perfil_nome,
  p.role,
  e.nome as empresa_nome,
  e.is_solo
FROM perfis p
LEFT JOIN empresas e ON p.empresa_id = e.id
ORDER BY p.criado_em DESC
LIMIT 10;

-- 3. Ver RLS
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'ATIVO' ELSE 'DESATIVADO' END as rls_status
FROM pg_tables 
WHERE tablename IN ('perfis', 'empresas');
```

**Me envie o resultado completo!**

---

## ✅ Checklist

- [ ] Executar query de contagem de perfis
- [ ] Verificar se retorna > 0
- [ ] Se 0, cadastrar usuário de teste
- [ ] Verificar RLS das tabelas
- [ ] Testar desabilitar RLS temporariamente
- [ ] Me enviar resultados das queries

---

## 🎯 Próximo Passo

**Execute o script de diagnóstico acima e me envie os resultados!**

Com isso vou saber exatamente qual é o problema e como resolver definitivamente. 🚀
