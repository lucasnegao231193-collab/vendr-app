# 🧪 Guia de Testes - Vendr Solo Mode

## ✅ Status da Implementação
- ✅ Build compilando sem erros
- ✅ TypeScript sem erros
- ✅ Todas as páginas e APIs criadas
- ✅ Documentação completa

---

## 📋 Checklist de Testes

### 1. Preparação do Ambiente

#### 1.1 Executar Migrações SQL
```bash
# No Supabase SQL Editor, executar na ordem:
1. supabase-migrations-v2-fixed.sql
2. supabase-solo-migration.sql
```

**Verificar:**
- [ ] Tabela `empresas` possui colunas `is_solo` e `plano`
- [ ] Tabela `solo_cotas` foi criada
- [ ] Políticas RLS estão ativas
- [ ] Funções `get_solo_cota_atual` e `increment_solo_cota` existem

#### 1.2 Iniciar Servidor Local
```bash
npm run dev
```

**Acessar:** http://localhost:3000/login

---

### 2. Teste de Cadastro Autônomo

#### 2.1 Acessar Login
- [ ] Navegar para `/login`
- [ ] Visualizar 3 abas: **Empresa** | **Autônomo** | **Funcionário**

#### 2.2 Criar Conta Autônoma
1. [ ] Clicar na aba "**Autônomo**"
2. [ ] Clicar em "**Criar conta de autônomo**"
3. [ ] Preencher formulário em `/onboarding/solo`:
   - Email: `autonomo@teste.com`
   - Senha: `teste123`
   - Nome: `João Autônomo`
   - Nome do negócio (opcional): `Vendas JP`
4. [ ] Clicar em "**Criar Conta Solo**"

**Resultado Esperado:**
- ✅ Registro criado no Supabase Auth
- ✅ Empresa criada com `is_solo = true` e `plano = 'solo_free'`
- ✅ Perfil criado com `role = 'owner'`
- ✅ Redirecionamento para `/solo` (Dashboard Solo)

---

### 3. Teste do Dashboard Solo

#### 3.1 Verificar Layout
Ao acessar `/solo`:
- [ ] **TopBar** azul com logo Vendr
- [ ] **Badge de Cota** exibindo "0/30 vendas"
- [ ] **4 KPI Cards**: Vendas Hoje, Lucro Estimado, Produtos Ativos, Estoque Total
- [ ] **Gráfico** de vendas (vazio inicialmente)
- [ ] **Ações Rápidas**: Nova Venda, Estoque, Financeiro, Assinatura

#### 3.2 Navegação
- [ ] Clicar em "**Nova Venda**" → Redireciona para `/solo/venda-nova`
- [ ] Clicar em "**Estoque**" → Redireciona para `/solo/estoque`
- [ ] Clicar em "**Financeiro**" → Redireciona para `/solo/financeiro`
- [ ] Clicar no badge "**Solo Free**" → Redireciona para `/solo/assinatura`

---

### 4. Teste de Estoque

#### 4.1 Adicionar Produtos
Navegar para `/solo/estoque`:
1. [ ] Clicar em "**+ Novo Produto**"
2. [ ] Adicionar 3 produtos de teste:
   
   **Produto 1:**
   - Nome: `Camisa Polo`
   - Preço: `R$ 49.90`
   - Estoque: `50`
   
   **Produto 2:**
   - Nome: `Calça Jeans`
   - Preço: `R$ 89.90`
   - Estoque: `30`
   
   **Produto 3:**
   - Nome: `Tênis Esportivo`
   - Preço: `R$ 149.90`
   - Estoque: `20`

**Verificar:**
- [ ] Produtos aparecem na tabela
- [ ] KPIs atualizam: "Produtos Ativos: 3"
- [ ] "Valor Total em Estoque" calcula corretamente

#### 4.2 Editar/Deletar Produto
- [ ] Editar um produto (alterar preço/estoque)
- [ ] Deletar um produto
- [ ] Verificar se mudanças refletem nos KPIs

---

### 5. Teste de Sistema de Cotas (CRÍTICO ⚠️)

#### 5.1 Registrar Vendas (1-29)
Navegar para `/solo/venda-nova`:

**Loop: Registrar 29 vendas**
1. [ ] Selecionar produto "Camisa Polo" (+1)
2. [ ] Selecionar método: **PIX**
3. [ ] Clicar em "**Finalizar Venda**"
4. [ ] Ver toast: "✓ Venda registrada!"
5. [ ] Verificar badge: "X/30 vendas" incrementa

**Repetir até atingir 29 vendas.**

#### 5.2 Registrar 30ª Venda (Última Permitida)
- [ ] Registrar venda 30
- [ ] Badge mostra: "**30/30 vendas**"
- [ ] Badge fica **amarelo** (alerta)

#### 5.3 Tentar 31ª Venda (BLOQUEIO)
- [ ] Tentar adicionar produto
- [ ] Clicar em "**Finalizar Venda**"

**Resultado Esperado:**
- ❌ **Modal de bloqueio** aparece
- 🚫 Mensagem: _"Você atingiu o limite de 30 vendas no plano Solo Free"_
- 🔄 Botão: **"Fazer Upgrade para Pro"**
- ❌ Venda **NÃO é registrada**

---

### 6. Teste de Upgrade para Solo Pro

#### 6.1 Acessar Página de Assinatura
- [ ] No modal de bloqueio, clicar em "**Fazer Upgrade**"
- [ ] OU navegar para `/solo/assinatura`

#### 6.2 Verificar Layout
- [ ] Ver comparação: **Solo Free** vs **Solo Pro**
- [ ] Ver recursos destacados (✓ Vendas ilimitadas, ✓ Exportações, etc.)
- [ ] Ver preço: **R$ 29,90/mês**
- [ ] Ver FAQ expandível

#### 6.3 Fazer Upgrade
1. [ ] Clicar em "**Fazer Upgrade Agora**"
2. [ ] Ver toast: "✓ Upgrade realizado com sucesso!"
3. [ ] Badge muda para: **"Solo Pro"** (verde)

**Verificar no Supabase:**
- [ ] `empresas.plano` = `'solo_pro'`

#### 6.4 Testar Vendas Ilimitadas
- [ ] Voltar para `/solo/venda-nova`
- [ ] Badge **não mostra mais** "X/30"
- [ ] Badge mostra apenas: **"Solo Pro ✓"**
- [ ] Registrar venda 31, 32, 33... → **SEM BLOQUEIO** ✅

---

### 7. Teste de Financeiro

#### 7.1 Acessar Relatório
Navegar para `/solo/financeiro`:
- [ ] Ver resumo por método de pagamento:
  - PIX: R$ XXX (X vendas)
  - Cartão: R$ XXX (X vendas)
  - Dinheiro: R$ XXX (X vendas)
- [ ] Ver **Total Geral**
- [ ] Ver gráfico de distribuição (Recharts)

#### 7.2 Filtros
- [ ] Filtrar por "**Hoje**" → Mostra vendas do dia
- [ ] Filtrar por "**Semana**" → Mostra últimos 7 dias
- [ ] Filtrar por "**Mês**" → Mostra mês atual
- [ ] Filtrar por "**Todos**" → Remove filtro

#### 7.3 Exportação (Apenas Solo Pro)
- [ ] Verificar que botão "**Exportar CSV**" está **habilitado**
- [ ] Clicar em "Exportar CSV"
- [ ] Arquivo `vendas-YYYY-MM-DD.csv` é baixado
- [ ] Abrir CSV e verificar dados corretos

---

### 8. Teste de Segurança (RLS)

#### 8.1 Isolamento de Dados
1. [ ] Criar **segunda conta** autônoma:
   - Email: `autonomo2@teste.com`
   - Senha: `teste123`
2. [ ] Fazer login com `autonomo2@teste.com`
3. [ ] Verificar dashboard está **vazio**
4. [ ] Verificar que **NÃO vê** produtos/vendas do `autonomo@teste.com`

**Resultado Esperado:**
- ✅ RLS isola dados por `empresa_id`
- ✅ Cada autônomo vê **apenas seus próprios dados**

#### 8.2 Testar API Diretamente (Postman/Thunder Client)
**GET `/api/solo/cotas`** (sem autenticação):
- [ ] Retorna `401 Unauthorized` ✅

**POST `/api/solo/vendas`** (com token inválido):
- [ ] Retorna `401 Unauthorized` ✅

---

### 9. Teste de Modo Empresa (Coexistência)

#### 9.1 Criar Conta Empresa
1. [ ] Navegar para `/login` → Aba "**Empresa**"
2. [ ] Clicar em "**Criar conta da empresa**"
3. [ ] Preencher onboarding empresa:
   - Email: `empresa@teste.com`
   - Senha: `teste123`
   - Nome da Empresa: `Tech Corp`
4. [ ] Finalizar cadastro

**Resultado Esperado:**
- ✅ Empresa criada com `is_solo = false` e `plano = 'plano1'`
- ✅ Redirecionamento para `/dashboard` (Dashboard Empresa)
- ✅ Dashboard mostra interface **diferente** (com gestão de vendedores)

#### 9.2 Verificar Isolamento
- [ ] Usuário empresa **NÃO** consegue acessar `/solo/*`
- [ ] Usuário autônomo **NÃO** consegue acessar `/vendedores`

---

### 10. Teste de Login com Seleção de Modo

#### 10.1 Login Autônomo
- [ ] Ir para `/login` → Aba "**Autônomo**"
- [ ] Fazer login com `autonomo@teste.com`
- [ ] Redireciona para `/solo` ✅

#### 10.2 Login Empresa
- [ ] Ir para `/login` → Aba "**Empresa**"
- [ ] Fazer login com `empresa@teste.com`
- [ ] Redireciona para `/dashboard` ✅

#### 10.3 Login Funcionário
- [ ] Criar vendedor na empresa
- [ ] Ir para `/login` → Aba "**Funcionário**"
- [ ] Fazer login com credenciais do vendedor
- [ ] Redireciona para `/vendedor` ✅

---

### 11. Teste de Reset de Cota (Simulação)

#### 11.1 Verificar Função SQL
No Supabase SQL Editor:
```sql
-- Verificar cota atual
SELECT * FROM get_solo_cota_atual('<empresa_id>');

-- Simular próximo mês (alterar ano_mes manualmente)
UPDATE solo_cotas 
SET ano_mes = '2025-11'
WHERE empresa_id = '<empresa_id>' AND ano_mes = '2025-10';

-- Verificar nova cota (deve criar novo registro)
SELECT * FROM get_solo_cota_atual('<empresa_id>');
```

**Resultado Esperado:**
- ✅ Função cria novo registro para novo mês
- ✅ `vendas_mes` volta para `0`
- ✅ Dashboard mostra "0/30 vendas" novamente

---

## 🚨 Bugs Conhecidos / Pendências

### Implementado ✅
- ✅ Login com 3 abas funcionando
- ✅ Sistema de cotas e bloqueio
- ✅ Upgrade para Solo Pro
- ✅ Dashboard e páginas Solo
- ✅ APIs `/api/solo/*`
- ✅ RLS e segurança
- ✅ Exportação CSV/PDF

### Pendente / Opcional ⏳
- ⏳ **Offline-first sync** (Zustand + IndexedDB)
  - Store criado mas **não integrado** nas páginas Solo
  - Apenas usado na página `/vendedor/venda`
- ⏳ **Integração de pagamento real** (Stripe/PagSeguro)
  - Atualmente upgrade é instantâneo sem cobrança
- ⏳ **Notificações por email** (aviso de limite atingido)
- ⏳ **Telemetria/Analytics** (rastrear eventos-chave)

---

## 📊 Critérios de Aceite

### Funcionalidades Core (Obrigatório)
- [x] Cadastro autônomo separado
- [x] Dashboard Solo funcional
- [x] Sistema de cotas (30 vendas/mês)
- [x] Bloqueio automático ao atingir limite
- [x] Upgrade para Solo Pro
- [x] Vendas ilimitadas após upgrade
- [x] Gestão de estoque
- [x] Relatório financeiro
- [x] Exportação de dados (CSV)
- [x] RLS e isolamento de dados
- [x] Coexistência com modo Empresa

### Performance
- [ ] Páginas carregam em < 2s
- [ ] Build do Next.js sem warnings críticos
- [ ] Sem erros no console do navegador

### UX/UI
- [ ] Design responsivo (mobile-first)
- [ ] Animações suaves (Framer Motion)
- [ ] Toasts informativos em todas as ações
- [ ] Loading states durante requisições

---

## 🎯 Próximos Passos

1. **Testes Manuais** (Este documento) ✅
2. **Testes Automatizados** (Opcional)
   - Playwright para E2E
   - Jest para testes unitários
3. **Deploy em Produção**
   - Executar migrations no Supabase de prod
   - Deploy na Vercel
   - Configurar variáveis de ambiente
4. **Monitoramento**
   - Configurar Sentry para erros
   - Analytics (Google Analytics/Plausible)

---

## 📞 Suporte

Caso encontre bugs durante os testes:
1. Abrir issue no GitHub
2. Ou entrar em contato via WhatsApp: +55 13 98140-1945

---

**Última atualização:** 2025-10-09  
**Versão:** 1.0.0
