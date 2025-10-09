# 🚀 Vendr SaaS - Sistema Completo de Gestão de Vendas

> Plataforma SaaS completa com modo Empresa e modo Autônomo (Vendr Solo)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modo Solo](#modo-solo)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)

---

## 🎯 Sobre o Projeto

Vendr é um SaaS de gestão de vendas externas que oferece dois modos de operação:

1. **Modo Empresa** - Para empresas com equipe de vendedores
2. **Modo Solo** - Para trabalhadores autônomos (one-person business)

### Características Principais

✅ **UI/UX Moderna** - Design profissional com animações Framer Motion  
✅ **Dark Mode** - Tema escuro completo  
✅ **Freemium** - Plano gratuito com upgrade para Pro  
✅ **Sistema de Cotas** - Limite de 30 vendas/mês no Solo Free  
✅ **Exportações** - PDF e CSV  
✅ **WhatsApp** - Botão flutuante de suporte  
✅ **Responsivo** - Mobile-first design  

---

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **Framer Motion** - Animações
- **Recharts** - Gráficos
- **jsPDF** - Exportação PDF

### Backend
- **Supabase** - Auth + Database + RLS
- **PostgreSQL** - Banco de dados
- **Zod** - Validação de schemas

### DevOps
- **Vercel** - Deploy automático
- **Git** - Controle de versão

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase

### Passo a Passo

```bash
# 1. Clonar repositório
git clone <seu-repo>
cd vendr-project

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local

# 4. Editar .env.local com suas credenciais Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave

# 5. Rodar o projeto
npm run dev
```

Acesse: `http://localhost:3000`

---

## ⚙️ Configuração

### 1. Configurar Banco de Dados

Execute o SQL no Supabase SQL Editor:

```sql
-- Executar os seguintes arquivos na ordem:
1. supabase-migrations-v2-fixed.sql  (migrations principais)
2. supabase-solo-migration.sql       (migrations do Solo)
```

### 2. Configurar RLS (Row Level Security)

As políticas RLS são criadas automaticamente pelas migrations.

### 3. Testar Autenticação

```bash
# Login teste
Email: seu-email@teste.com
Senha: senha123
```

---

## ✨ Funcionalidades

### Modo Empresa

#### 1. Dashboard
- KPIs animados (vendas, faturamento, ticket médio)
- Gráfico de vendas por vendedor
- Alertas inteligentes (estoque baixo, vendedores inativos)
- Ações rápidas

#### 2. Vendedores
- CRUD completo
- Cadastro com email/senha (integrado com Auth)
- Atribuição de kits
- Controle de comissão

#### 3. Produtos
- CRUD completo
- Gestão de estoque
- Movimentações (entrada/saída)
- Alertas de estoque baixo

#### 4. Vendas
- Registro de vendas por vendedor
- Filtros por data e método de pagamento
- Exportação PDF/CSV

### Modo Solo (Autônomo)

#### 1. Dashboard Solo
- KPIs personalizados
- Badge de cota (X/30 vendas)
- Ações rápidas
- Gráficos simplificados

#### 2. Nova Venda
- Grid de produtos com +/-
- Seleção de método (PIX/Cartão/Dinheiro)
- Validação de estoque
- **Bloqueio automático** ao atingir 30 vendas (Solo Free)

#### 3. Estoque
- CRUD de produtos
- Controle de estoque
- KPIs (produtos ativos, valor total)

#### 4. Financeiro
- Resumo por método de pagamento
- Filtros (hoje/semana/mês)
- Gráficos de distribuição
- Exportação CSV

#### 5. Assinatura
- Comparação Solo Free vs Solo Pro
- Upgrade com um clique
- FAQ integrado

---

## 📁 Estrutura do Projeto

```
vendr-project/
├── app/
│   ├── api/
│   │   └── solo/              # APIs do modo Solo
│   │       ├── vendas/
│   │       ├── cotas/
│   │       ├── stats/
│   │       └── upgrade/
│   ├── solo/                  # Páginas do modo Solo
│   │   ├── page.tsx           # Dashboard
│   │   ├── venda-nova/
│   │   ├── vendas/
│   │   ├── estoque/
│   │   ├── financeiro/
│   │   └── assinatura/
│   ├── onboarding/
│   │   └── solo/              # Onboarding autônomo
│   ├── dashboard/             # Dashboard empresa
│   ├── vendedores/            # CRUD vendedores
│   ├── produtos/              # CRUD produtos
│   └── login/                 # Login com 3 abas
├── components/
│   ├── ModernTopBar.tsx       # TopBar azul
│   ├── WhatsAppFloat.tsx      # Botão WhatsApp
│   ├── SoloPlanBadge.tsx      # Badge de cota
│   ├── ExportButtons.tsx      # Export PDF/CSV
│   └── ...                    # Outros componentes
├── lib/
│   ├── solo-helpers.ts        # Funções helper Solo
│   └── solo-schemas.ts        # Schemas Zod
├── types/
│   └── solo.ts                # Tipos TypeScript
├── supabase-solo-migration.sql
└── README_VENDR_SOLO.md
```

---

## 🎯 Modo Solo - Detalhes

### Sistema de Cotas

#### Solo Free
- **Limite:** 30 vendas/mês
- **Bloqueio:** Automático ao atingir limite
- **Reset:** Automático no próximo mês
- **Preço:** Grátis

#### Solo Pro
- **Limite:** Ilimitado
- **Recursos extras:** 
  - Exportações PDF/CSV
  - Relatórios avançados
  - Gráficos detalhados
  - Suporte prioritário
- **Preço:** R$ 29,90/mês

### Fluxo de Uso

```
1. Cadastro → /onboarding/solo
   ↓
2. Dashboard → /solo
   ↓
3. Adicionar Produtos → /solo/estoque
   ↓
4. Registrar Vendas → /solo/venda-nova
   ↓
5. [Ao atingir 30 vendas] → Bloqueio com CTA
   ↓
6. Upgrade → /solo/assinatura
   ↓
7. Vendas Ilimitadas ✓
```

### Validações

- ✅ Estoque suficiente antes de vender
- ✅ Cota disponível antes de vender
- ✅ Decrementar estoque após venda
- ✅ Incrementar cota após venda
- ✅ Bloquear se `vendas_mes >= 30` (Solo Free)

---

## 🔌 API Endpoints

### Solo APIs

#### POST /api/solo/vendas
Criar nova venda com validação de cota.

**Request:**
```json
{
  "itens": [
    { "produto_id": "uuid", "qtd": 2 }
  ],
  "metodo_pagamento": "pix"
}
```

**Response (Success):**
```json
{
  "success": true,
  "vendas": [...],
  "valor_total": 50.00
}
```

**Response (Limite Atingido):**
```json
{
  "error": "Limite atingido",
  "upgrade_required": true
}
```

#### GET /api/solo/vendas
Listar vendas com filtros.

**Query Params:**
- `data_inicio` - Data início (YYYY-MM-DD)
- `data_fim` - Data fim (YYYY-MM-DD)
- `metodo_pagamento` - pix|cartao|dinheiro

#### GET /api/solo/cotas
Obter cota atual do mês.

**Response:**
```json
{
  "ano_mes": "2025-01",
  "vendas_mes": 15,
  "limite": 30,
  "plano": "solo_free",
  "limite_atingido": false
}
```

#### GET /api/solo/stats
Estatísticas do dashboard.

**Response:**
```json
{
  "vendasHoje": 5,
  "lucroEstimado": 250.50,
  "produtosAtivos": 12,
  "estoqueTotal": 450
}
```

#### POST /api/solo/upgrade
Fazer upgrade para Solo Pro.

**Request:**
```json
{
  "plano": "solo_pro"
}
```

---

## 🎨 Design System

### Cores

```css
/* Primária */
--brand-primary: #0057FF;  /* Azul Vendr */
--brand-accent: #FF6B00;   /* Laranja */

/* Backgrounds */
--background: #F8F9FB;
--card: #FFFFFF;

/* Text */
--text-primary: #121212;
--text-secondary: #6B7280;

/* Status */
--success: #16A34A;
--warning: #F59E0B;
--error: #DC2626;
```

### Componentes Reutilizáveis

- **ModernTopBar** - Barra de navegação
- **Breadcrumbs** - Navegação contextual
- **StatusBadge** - Badges coloridos
- **LoadingSkeleton** - Skeleton loading
- **ExportButtons** - Exportação de dados

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# 1. Conectar repositório na Vercel
vercel

# 2. Configurar variáveis de ambiente
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 3. Deploy automático a cada push
git push origin main
```

### Outras Plataformas

- **Railway** - Deploy com PostgreSQL
- **Render** - Deploy gratuito
- **AWS** - Para produção em escala

---

## 📊 Banco de Dados

### Tabelas Principais

| Tabela | Função |
|--------|--------|
| `empresas` | Dados das empresas (+ is_solo, plano) |
| `perfis` | Perfis de usuários (role: owner/seller) |
| `vendedores` | Vendedores da empresa |
| `produtos` | Catálogo de produtos |
| `vendas` | Registro de vendas |
| `solo_cotas` | Controle de cotas mensais Solo |

### RLS (Row Level Security)

Todas as tabelas têm políticas RLS baseadas em `empresa_id`:

```sql
-- Exemplo: Vendas
CREATE POLICY "Users can view their company sales"
  ON vendas FOR SELECT
  USING (empresa_id IN (
    SELECT empresa_id FROM perfis WHERE user_id = auth.uid()
  ));
```

---

## 🧪 Testes

### Testar Modo Solo

1. **Cadastro:**
   - Ir para `/login` → aba "Autônomo"
   - Criar conta com email/senha
   - Verificar redirect para `/solo`

2. **Adicionar Produtos:**
   - Ir para `/solo/estoque`
   - Adicionar 3 produtos de teste

3. **Registrar Vendas:**
   - Ir para `/solo/venda-nova`
   - Registrar 29 vendas → OK
   - Registrar 30ª venda → OK
   - Tentar 31ª → **BLOQUEADO** ✓

4. **Upgrade:**
   - Ir para `/solo/assinatura`
   - Clicar em "Fazer Upgrade"
   - Verificar plano mudou para Pro
   - Tentar nova venda → **SEM LIMITE** ✓

### Testar Cadastro Vendedor

1. Login como empresa
2. Ir para `/vendedores`
3. Criar vendedor com email/senha
4. Fazer logout
5. Login com credenciais do vendedor ✓

---

## 📝 Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# WhatsApp (opcional)
NEXT_PUBLIC_WHATSAPP_NUMBER=5513981401945

# Ambiente
NODE_ENV=production
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 📞 Suporte

- **WhatsApp:** +55 13 98140-1945
- **Email:** suporte@vendr.com.br
- **Documentação:** [docs.vendr.com.br](https://docs.vendr.com.br)

---

## 🎉 Créditos

Desenvolvido com ❤️ por [Seu Nome]

**Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS

---

**🚀 Vendr - Gestão de Vendas Simples e Poderosa**
