# 🚀 Vendr V2 - Guia de Configuração Completo

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação](#instalação)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Migrações SQL](#migrações-sql)
6. [Executar Projeto](#executar-projeto)
7. [Funcionalidades Implementadas](#funcionalidades-implementadas)
8. [Checklist de Testes](#checklist-de-testes)

---

## 🔧 Pré-requisitos

- **Node.js** 18+ instalado
- **Conta Supabase** (gratuita em supabase.com)
- **Git** instalado

---

## 📦 Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Instalar Pacotes Radix UI (Componentes)

```bash
npm install @radix-ui/react-progress @radix-ui/react-avatar @radix-ui/react-scroll-area
```

---

## ⚙️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Configure:
   - **Name**: Vendr
   - **Database Password**: [escolha uma senha forte]
   - **Region**: South America (São Paulo)
4. Aguarde a criação do projeto

### 2. Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon/public key**: chave pública
   - **service_role key**: chave privada (⚠️ NUNCA exponha no client)

---

## 🔐 Variáveis de Ambiente

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie `.env.local`:

```env
# Supabase (públicas - podem ir no client)
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Supabase Service Role (PRIVADA - apenas server)
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# PIX (chave estática para MVP)
NEXT_PUBLIC_VENDR_PIX_KEY=11999887766

# Timezone
NEXT_PUBLIC_TZ=America/Sao_Paulo
```

⚠️ **IMPORTANTE**: 
- `SUPABASE_SERVICE_ROLE_KEY` **NUNCA** deve ser exposta no client
- É usada apenas em rotas API server-side

---

## 🗄️ Migrações SQL

### 1. Executar Schema Inicial

1. Abra **Supabase** → **SQL Editor**
2. Cole o conteúdo de `supabase-schema.sql`
3. Clique em **Run**

### 2. Executar Migrações V2

1. No **SQL Editor**, abra nova query
2. Cole o conteúdo de `supabase-migrations-v2.sql`
3. Clique em **Run**
4. Verifique mensagens de sucesso:
   ```
   ✅ Vendr V2 - Migrações aplicadas com sucesso!
   📦 Estoque e movimentações configurados
   💬 Sistema de chat habilitado
   🔔 Notificações e insights criados
   ```

### 3. Verificar Tabelas Criadas

No **Table Editor**, você deve ver:
- `empresas`, `perfis`, `vendedores`, `produtos`
- `vendas`, `kits`, `kit_itens`
- `estoques`, `estoque_movs`
- `notificacoes`, `mensagens`
- `metas_vendedores`, `despesas`
- `audit_logs`

---

## 🚀 Executar Projeto

```bash
npm run dev
```

Abra http://localhost:3000

---

## ✨ Funcionalidades Implementadas

### 1. **Login com Abas**
- ✅ Aba "Empresa" (owner)
- ✅ Aba "Funcionário" (seller)
- ✅ Redirecionamento baseado em role
- ✅ Links para recuperação de senha e registro

### 2. **Criação de Vendedores com Email/Senha**
- ✅ Dialog com formulário completo
- ✅ Campos: Nome, Email (login), Senha, Telefone, Documento, Comissão
- ✅ Validação Zod (email válido, senha >= 8 chars)
- ✅ API server-only com Service Role Key
- ✅ Limite baseado no plano (3/5/10 vendedores)
- ✅ Criação automática de usuário no Supabase Auth
- ✅ Vendedor pode logar imediatamente

### 3. **Dashboard Empresa - Abas Secundárias**
- ✅ Navegação: **Vendedores** | **Estoque** | **Financeiro**
- ✅ Estilo: fundo branco, borda cinza, ativo azul #0057FF
- ✅ Clique redireciona para página correspondente

### 4. **Página Estoque**
- ✅ KPIs: Itens distintos, Unidades totais, Valor total
- ✅ Tabela com colunas: Produto, Marca, Preço, Qtd, Status, Ações
- ✅ Filtros: Busca, Marca, Status (ativo/inativo)
- ✅ Exportar CSV
- ✅ Badge vermelho para estoque < 5

### 5. **Módulo Financeiro**
- ✅ KPIs: Faturamento, Lucro, Comissões a Pagar, Despesas
- ✅ Gráfico de linha: Faturamento diário (últimos 7 dias)
- ✅ Gráfico de pizza: Métodos de pagamento
- ✅ Breakdown: PIX, Dinheiro, Cartão
- ✅ Lista de despesas recentes

### 6. **Sistema de Insights/Alertas**
- ✅ Vendedores ociosos (sem venda há 2+ dias)
- ✅ Estoque baixo (< 5 unidades)
- ✅ Produto mais vendido do mês
- ✅ Alertas de desempenho
- ✅ Cards com ícones e badges

### 7. **Dashboard do Vendedor Melhorado**
- ✅ Meta diária com barra de progresso
- ✅ KPIs: Total vendido, Comissão acumulada, Vendas realizadas
- ✅ Alertas: "Falta X para meta", "Parabéns, meta atingida!"
- ✅ Histórico de vendas com timeline
- ✅ Quick actions: Registrar venda, Ver estoque
- ✅ Comissão potencial calculada em tempo real

### 8. **Chat Interno**
- ✅ Conversa empresa ↔ vendedor
- ✅ Realtime com Supabase
- ✅ Avatares com iniciais
- ✅ Mensagens com timestamp
- ✅ ScrollArea automático

### 9. **Geolocalização em Vendas**
- ✅ Campos: `latitude`, `longitude`, `localizacao_timestamp`
- ✅ Função `getCurrentLocation()` com permissão do navegador
- ✅ Link para Google Maps
- ✅ Cálculo de distância (Haversine)

### 10. **Controle de Estoque Automático**
- ✅ Criar produto → estoque inicializado com qtd=0
- ✅ Aceitar kit → baixa automática do estoque
- ✅ Registro de movimentações (entrada, saída, ajuste, saida_kit)
- ✅ Trigger `baixar_estoque_kit()` ao aceitar kit

### 11. **Auditoria e Segurança**
- ✅ Logs de auditoria: criar vendedor, movimentar estoque
- ✅ RLS 100% ativo em todas as tabelas
- ✅ Políticas owner/seller segregadas
- ✅ Service Role apenas em rotas server-only

---

## ✅ Checklist de Testes

### **1. Login e Autenticação**
- [ ] Login como Empresa (aba Empresa) → redireciona `/dashboard`
- [ ] Login como Funcionário (aba Funcionário) → redireciona `/vendedor`
- [ ] Link "Esqueci senha" funciona
- [ ] Link "Criar conta" leva ao onboarding

### **2. Criação de Vendedores**
- [ ] Clicar "Criar Vendedor" abre dialog
- [ ] Preencher: Nome, Email, Senha (mín. 8 chars)
- [ ] Criar vendedor com sucesso
- [ ] Vendedor aparece na lista
- [ ] Tentar criar além do limite do plano → erro 422
- [ ] Vendedor consegue logar com email/senha criados

### **3. Navegação Dashboard**
- [ ] Abas "Vendedores", "Estoque", "Financeiro" aparecem
- [ ] Clicar em "Estoque" → vai para `/estoque`
- [ ] Clicar em "Financeiro" → vai para `/financeiro`
- [ ] Aba ativa fica azul (#0057FF)

### **4. Estoque**
- [ ] KPIs mostram valores corretos
- [ ] Filtrar por nome de produto funciona
- [ ] Filtrar por marca funciona
- [ ] Filtrar por status (ativo/inativo)
- [ ] Exportar CSV gera arquivo
- [ ] Produtos com qtd < 5 têm badge vermelho

### **5. Financeiro**
- [ ] KPIs calculados corretamente
- [ ] Gráfico de linha mostra últimos 7 dias
- [ ] Gráfico de pizza mostra métodos de pagamento
- [ ] Despesas aparecem na lista

### **6. Insights**
- [ ] Alerta de vendedor ocioso aparece (se houver)
- [ ] Alerta de estoque baixo aparece (se houver)
- [ ] Produto mais vendido é exibido
- [ ] Badges "Atenção" e "Top" aparecem

### **7. Dashboard Vendedor**
- [ ] Meta diária aparece (se configurada)
- [ ] Barra de progresso atualiza
- [ ] Alerta "Falta X para meta" aparece
- [ ] Histórico de vendas mostra timeline
- [ ] Comissão calculada corretamente
- [ ] Quick actions levam às páginas corretas

### **8. Chat**
- [ ] Enviar mensagem (empresa → vendedor)
- [ ] Mensagem aparece em tempo real
- [ ] Avatar com inicial do nome
- [ ] Scroll automático para última mensagem

### **9. Geolocalização**
- [ ] Ao registrar venda, captura localização (se permitido)
- [ ] `latitude` e `longitude` salvos no banco
- [ ] Link do Google Maps funciona

### **10. Estoque Automático**
- [ ] Criar produto → estoque criado com qtd=0
- [ ] Atribuir kit → estoque baixa automaticamente
- [ ] Movimentação registrada em `estoque_movs`
- [ ] Erro se estoque insuficiente

---

## 🎨 Paleta de Cores

- **Azul Confiança**: `#0057FF`
- **Laranja Explosão**: `#FF6B00`
- **Cinza Claro**: `#F5F6F8`
- **Texto**: `#3A3A3A`
- **Verde**: `#10B981`
- **Vermelho**: `#EF4444`

---

## 🐛 Troubleshooting

### Erro: "Cannot find module @radix-ui/..."
```bash
npm install @radix-ui/react-progress @radix-ui/react-avatar @radix-ui/react-scroll-area
```

### Erro: "SUPABASE_SERVICE_ROLE_KEY is not defined"
- Verifique se `.env.local` existe
- Confirme que a variável está definida
- Reinicie o servidor: `npm run dev`

### Erro: "column does not exist"
- Execute as migrações SQL completas
- Verifique no **Table Editor** se as tabelas foram criadas

### RLS bloqueando queries
- Confirme que o usuário tem perfil em `perfis`
- Verifique se `empresa_id` está correto
- Teste as políticas RLS no **SQL Editor**

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte a documentação do Supabase
3. Revise os logs no console do navegador (F12)

---

## 🎉 Pronto!

Seu Vendr V2 está configurado e pronto para uso! 🚀

**Próximos Passos**:
- Criar conta de empresa
- Adicionar vendedores
- Cadastrar produtos
- Registrar primeiras vendas
- Acompanhar KPIs e insights

**Boas vendas!** 💰
