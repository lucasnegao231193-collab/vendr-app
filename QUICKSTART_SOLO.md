# ⚡ Quick Start - Vendr Solo Mode

## 🎯 Objetivo
Colocar o Vendr Solo Mode rodando em **5 minutos**.

---

## 📋 Pré-requisitos

✅ Node.js 18+  
✅ Conta Supabase criada  
✅ Projeto Vendr clonado

---

## 🚀 Setup em 5 Passos

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Variáveis de Ambiente
```bash
# Copiar exemplo
cp .env.local.example .env.local

# Editar com suas credenciais Supabase
# .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 3️⃣ Executar Migrations SQL

**No Supabase SQL Editor, executar na ordem:**

**Passo 1:** `supabase-migrations-v2-fixed.sql`
```sql
-- Copiar TODO o conteúdo do arquivo
-- Colar no SQL Editor
-- Clicar em "Run"
```

**Passo 2:** `supabase-solo-migration.sql`
```sql
-- Copiar TODO o conteúdo do arquivo
-- Colar no SQL Editor
-- Clicar em "Run"
```

**Verificar:**
```sql
-- Verificar se tabela solo_cotas existe
SELECT * FROM solo_cotas LIMIT 1;

-- Verificar colunas is_solo e plano
SELECT id, nome, is_solo, plano FROM empresas LIMIT 1;
```

### 4️⃣ Iniciar Servidor
```bash
npm run dev
```

**Aguardar:**
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

### 5️⃣ Criar Primeira Conta Solo

1. Abrir: http://localhost:3000/login
2. Clicar na aba **"Autônomo"**
3. Clicar em **"Criar conta de autônomo"**
4. Preencher:
   - Email: `teste@solo.com`
   - Senha: `senha123`
   - Nome: `João Silva`
   - Negócio: `Vendas JP` (opcional)
5. Clicar em **"Criar Conta Solo"**
6. ✅ Você será redirecionado para `/solo`

---

## ✅ Verificar Implementação

### Dashboard Solo Carregou?
Você deve ver:
- ✅ TopBar azul com "Vendr"
- ✅ Badge "Solo Free" (0/30 vendas)
- ✅ 4 Cards de KPIs
- ✅ Botões: Nova Venda, Estoque, Financeiro, Assinatura

### Testar Fluxo Completo (2 min)

**1. Adicionar Produto:**
- Clicar em "**Estoque**" (menu lateral ou card)
- Clicar em "**+ Novo Produto**"
- Preencher:
  - Nome: `Camisa Polo`
  - Preço: `49.90`
  - Estoque: `100`
- Salvar

**2. Registrar Venda:**
- Voltar ao Dashboard
- Clicar em "**Nova Venda**"
- Clicar em **+** ao lado de "Camisa Polo" (adicionar 1)
- Selecionar método: **PIX**
- Clicar em "**Finalizar Venda**"
- ✅ Toast: "Venda registrada!"
- ✅ Badge: "1/30 vendas"

**3. Verificar no Banco:**
```sql
-- No Supabase SQL Editor
SELECT * FROM vendas ORDER BY created_at DESC LIMIT 1;
SELECT * FROM solo_cotas;
```

---

## 🧪 Testar Sistema de Cotas

### Simular 30 Vendas (Script)

**Opção 1: Via UI (Manual)**
- Repetir "Registrar Venda" 30 vezes
- Badge vai de 1/30 → 2/30 → ... → 30/30

**Opção 2: Via SQL (Rápido)**
```sql
-- No Supabase SQL Editor

-- 1. Pegar sua empresa_id
SELECT id, nome FROM empresas WHERE is_solo = true;

-- 2. Criar 30 vendas de uma vez
DO $$
DECLARE
  v_empresa_id UUID := '<seu-empresa-id-aqui>';
  v_produto_id UUID;
  i INT;
BEGIN
  -- Pegar primeiro produto
  SELECT id INTO v_produto_id FROM produtos WHERE empresa_id = v_empresa_id LIMIT 1;
  
  -- Criar 30 vendas
  FOR i IN 1..30 LOOP
    INSERT INTO vendas (empresa_id, produto_id, qtd, valor_unit, meio_pagamento, status)
    VALUES (v_empresa_id, v_produto_id, 1, 49.90, 'pix', 'confirmado');
    
    -- Incrementar cota
    PERFORM increment_solo_cota(v_empresa_id);
  END LOOP;
END $$;
```

**3. Atualizar página → Badge: "30/30 vendas" (amarelo)**

**4. Tentar venda 31:**
- Nova Venda → Adicionar produto → Finalizar
- ❌ Modal de bloqueio aparece!
- 🔒 "Limite atingido"

### Testar Upgrade

1. No modal, clicar **"Fazer Upgrade"**
2. Comparar planos Solo Free vs Pro
3. Clicar **"Fazer Upgrade Agora"**
4. ✅ Badge muda para "Solo Pro" (verde)
5. Tentar venda 31 → **Sucesso!** (sem limite)

---

## 🔍 Debug Rápido

### Erro: "Não foi possível conectar ao Supabase"
```bash
# Verificar .env.local
cat .env.local

# Testar conexão
curl https://seu-projeto.supabase.co/rest/v1/empresas \
  -H "apikey: sua-anon-key"
```

### Erro: "Função get_solo_cota_atual não existe"
```sql
-- Verificar funções SQL
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%solo%';

-- Se vazio, re-executar supabase-solo-migration.sql
```

### Erro: "Venda não incrementa cota"
```sql
-- Verificar trigger
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'vendas';

-- Verificar logs
SELECT * FROM solo_cotas ORDER BY created_at DESC;
```

### Badge não aparece
- Verificar no DevTools (F12) → Console
- Procurar erro: "Failed to fetch /api/solo/cotas"
- Verificar autenticação:
```typescript
// No browser console
console.log(await supabase.auth.getUser());
```

---

## 📊 Checklist Pós-Setup

- [ ] Servidor rodando em `localhost:3000`
- [ ] Migrations executadas sem erro
- [ ] Conta Solo criada com sucesso
- [ ] Dashboard carrega corretamente
- [ ] Badge "Solo Free" visível
- [ ] Produto adicionado ao estoque
- [ ] Venda registrada (badge incrementa)
- [ ] Cota visível no Supabase (`solo_cotas`)
- [ ] Bloqueio funciona aos 30 vendas
- [ ] Upgrade para Pro funcional

---

## 🎓 Próximos Passos

### Testes Completos
📖 Seguir `TESTE_SOLO_MODE.md` para checklist detalhado

### Personalizar
- Alterar cores em `app/globals.css`
- Customizar textos em `types/solo.ts` (PLANOS_SOLO)
- Ajustar limite em migrations (30 → outro valor)

### Deploy
📖 Seguir `DEPLOY-GUIDE.md` ou `SUMARIO_IMPLEMENTACAO_SOLO.md`

---

## 🆘 Ajuda

**Problemas durante setup?**
1. Verificar `TESTE_SOLO_MODE.md` → Seção "🚨 Bugs Conhecidos"
2. Verificar console do navegador (F12)
3. Verificar logs do Next.js no terminal
4. Abrir issue no GitHub

**WhatsApp:** +55 13 98140-1945

---

## 📚 Documentação Completa

| Arquivo | Conteúdo |
|---------|----------|
| `README_VENDR_SOLO.md` | Documentação técnica completa |
| `TESTE_SOLO_MODE.md` | Checklist de testes detalhado |
| `SUMARIO_IMPLEMENTACAO_SOLO.md` | Visão executiva da implementação |
| `QUICKSTART_SOLO.md` | Este guia (início rápido) |

---

**🚀 Boa sorte com os testes!**
