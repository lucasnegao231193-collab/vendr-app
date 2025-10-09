# 🚀 Guia de Upgrade - Vendr v2

## ✅ O Que Foi Implementado

### 1. Login com Abas (Empresa x Funcionário)
- `/login` agora tem duas abas
- Redirecionamento automático baseado em role (owner → /dashboard, seller → /vendedor)
- Links para "Esqueci senha" e "Criar conta"

### 2. Planos e Limites de Vendedores
- **Plano 1**: até 3 vendedores
- **Plano 2**: até 5 vendedores  
- **Plano 3**: até 10 vendedores
- Bloqueio automático ao atingir limite
- Contador visual "X/Y" nas páginas

### 3. Catálogo com Marca
- Campo `marca` adicionado aos produtos
- Filtros por marca e status (ativo/inativo)
- UI melhorada com busca

### 4. Atribuição de Estoque com Timestamps
- `assigned_at`: quando empresa envia estoque
- `accepted_at`: quando vendedor aceita
- `status`: pendente/aceito/recusado
- `valor_unit_atribuido`: snapshot do preço no momento da atribuição

### 5. Aceite do Vendedor
- Card amarelo aparece quando há kit pendente
- Botões "Aceitar" e "Recusar"
- Timestamp "Enviado há X minutos"

### 6. APIs Criadas/Atualizadas
- `POST /api/vendedores` - valida limite do plano
- `POST /api/kits` - atribui estoque com snapshot de preço
- `POST /api/kits/aceite` - aceitar/recusar kit
- `GET /api/kits/aceite` - buscar kits pendentes

### 7. Componentes Novos
- `<KitAceiteCard>` - card de aceite para vendedor
- Filtros em produtos (marca, ativo)
- Contador de limite em vendedores

---

## 📋 Como Aplicar as Melhorias

### PASSO 1: Executar Migrações SQL

No Supabase → SQL Editor, execute:

```bash
# Abrir arquivo
supabase-migrations.sql
```

Cole TODO o conteúdo e clique em **"Run"**.

Isso vai:
- ✅ Adicionar coluna `plano` em `empresas`
- ✅ Adicionar coluna `marca` em `produtos`
- ✅ Adicionar `assigned_at`, `status`, `accepted_at` em `kits`
- ✅ Adicionar `valor_unit_atribuido` em `kit_itens`
- ✅ Criar funções helpers (limites, contadores)
- ✅ Criar trigger para validar limite de vendedores
- ✅ Atualizar RLS para sellers

### PASSO 2: Reiniciar Servidor

```bash
# Parar servidor (Ctrl+C)
# Rodar novamente
npm run dev
```

### PASSO 3: Testar Novo Fluxo

#### Como Empresa:
1. Acesse `/login` → aba **Empresa**
2. Faça login
3. Vá em `/produtos`:
   - Adicione marca aos produtos
   - Teste filtros
4. Vá em `/vendedores`:
   - Veja contador "X/3" (limite do plano1)
   - Tente criar mais vendedores que o limite → deve bloquear
5. Atribua estoque a um vendedor (API `/api/kits`)

#### Como Vendedor:
1. Abra nova aba anônima
2. `/login` → aba **Funcionário**
3. Faça login com credenciais de vendedor
4. Vá em `/vendedor`:
   - Deve aparecer **card amarelo** com kit pendente
   - Clique "Aceitar"
   - Card desaparece e estoque fica disponível

---

## 🔧 Configurações Adicionais

### Mudar Plano da Empresa

No Supabase:
```sql
UPDATE empresas 
SET plano = 'plano2'  -- ou 'plano3'
WHERE id = 'seu-empresa-id';
```

### Criar Vendedor Manualmente (se trigger bloquear)

Apenas para testes/desenvolvimento:
```sql
-- Desabilitar trigger temporariamente
ALTER TABLE vendedores DISABLE TRIGGER trg_validate_vendedor_limit;

-- Inserir vendedor
INSERT INTO vendedores (nome, empresa_id, comissao_padrao, ativo)
VALUES ('João Silva', 'empresa-uuid', 0.1, true);

-- Reabilitar trigger
ALTER TABLE vendedores ENABLE TRIGGER trg_validate_vendedor_limit;
```

### Verificar Limites

```sql
-- Ver resumo por empresa
SELECT * FROM v_empresas_vendedores_summary;

-- Verificar se pode criar vendedor
SELECT can_create_vendedor('empresa-uuid');
```

---

## 📊 Estrutura de Dados

### Empresas
```sql
plano: 'plano1' | 'plano2' | 'plano3'
```

### Produtos
```sql
marca: text (nullable)
```

### Kits
```sql
assigned_at: timestamptz (default now())
status: 'pendente' | 'aceito' | 'recusado'
accepted_at: timestamptz (nullable)
```

### Kit_Itens
```sql
valor_unit_atribuido: numeric (snapshot do preço)
```

---

## 🧪 Testes

### Testar Limite de Plano
1. Crie empresa (plano1 = 3 vendedores)
2. Crie 3 vendedores → OK
3. Tente criar 4º → deve retornar erro 422

### Testar Aceite de Kit
1. Empresa atribui estoque (POST /api/kits)
2. Vendedor faz login → vê card amarelo
3. Vendedor aceita → `accepted_at` gravado
4. Card desaparece

### Testar Snapshot de Preço
1. Crie produto "Sorvete" por R$ 5,00
2. Atribua 10x ao vendedor
3. Altere preço para R$ 6,00 no cadastro
4. Vendedor deve ver R$ 5,00 (snapshot) nas vendas

---

## 🐛 Troubleshooting

### "Limite de vendedores atingido"
✅ É esperado! Upgrade o plano:
```sql
UPDATE empresas SET plano = 'plano2' WHERE id = '...';
```

### "Kit não aparece para vendedor"
✅ Verifique RLS:
```sql
-- Testar policy
SELECT * FROM kits WHERE vendedor_id = 'vendedor-uuid';
```

### "Erro ao aceitar kit"
✅ Verifique se seller tem perfil:
```sql
SELECT * FROM perfis WHERE role = 'seller';
```

### "valor_unit_atribuido = 0"
✅ Execute migração completa:
```sql
ALTER TABLE kit_itens 
ADD COLUMN IF NOT EXISTS valor_unit_atribuido numeric NOT NULL DEFAULT 0;
```

---

## 📈 Próximas Melhorias Sugeridas

- [ ] Página `/vendedores/[id]` com histórico de kits
- [ ] Modal de atribuição de estoque com seletor de produtos
- [ ] Dashboard com KPI "Kits pendentes"
- [ ] Notificações push para aceite de kit
- [ ] Relatório de uso por plano
- [ ] Upgrade de plano via Stripe

---

**Todas as melhorias foram implementadas com sucesso!** 🎉

Qualquer dúvida, consulte o código ou abra uma issue.
