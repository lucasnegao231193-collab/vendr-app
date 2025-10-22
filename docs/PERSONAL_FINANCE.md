# Módulo de Finanças Pessoais - Painel Venlo

## 📋 Visão Geral

O módulo de Finanças Pessoais adiciona ao Painel Venlo a capacidade de alternar entre dois modos:
- **Profissional**: Gestão de vendas, serviços, comissões (funcionalidade existente)
- **Pessoal**: Controle financeiro pessoal com transações, metas e relatórios

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `financas_pessoais`
Armazena todas as transações financeiras pessoais do usuário.

```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- tipo: text ('entrada' | 'saida')
- categoria: text
- descricao: text (opcional)
- valor: numeric(12,2)
- data: date
- created_at: timestamptz
- updated_at: timestamptz
```

#### `metas_pessoais`
Armazena metas de economia mensal por usuário.

```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- ano: int
- mes: int (1-12)
- meta_economia: numeric(12,2)
- created_at: timestamptz
- updated_at: timestamptz
- UNIQUE(user_id, ano, mes)
```

### Segurança (RLS)

Todas as tabelas possuem Row Level Security habilitado:
- Usuários só podem ver/editar seus próprios dados
- Políticas: SELECT, INSERT, UPDATE, DELETE baseadas em `auth.uid() = user_id`

## 🔌 API Endpoints

### Transações

**GET** `/api/pessoal/transacoes`
- Query params: `tipo`, `categoria`, `dataInicio`, `dataFim`, `limit`, `offset`
- Retorna: Array de transações

**POST** `/api/pessoal/transacoes`
- Body: `{ tipo, categoria, descricao?, valor, data }`
- Retorna: Transação criada

**PATCH** `/api/pessoal/transacoes/:id`
- Body: Campos parciais para atualizar
- Retorna: Transação atualizada

**DELETE** `/api/pessoal/transacoes/:id`
- Retorna: `{ success: true }`

### Metas

**GET** `/api/pessoal/meta?ano=2025&mes=1`
- Retorna: Meta do mês ou 404

**PUT** `/api/pessoal/meta`
- Body: `{ ano, mes, meta_economia }`
- Retorna: Meta criada/atualizada (upsert)

## 🎣 Hooks Disponíveis

### `useVenloMode()`
Gerencia o modo atual do painel (Profissional/Pessoal).

```typescript
const { mode, setMode, toggleMode, isProfissional, isPessoal, isLoading } = useVenloMode();
```

- Persistência: localStorage + cookie
- Default: 'PROFISSIONAL'

### `useFinancasPessoais()`
CRUD de transações financeiras.

```typescript
const { 
  transacoes, 
  isLoading, 
  fetchTransacoes, 
  createTransacao, 
  updateTransacao, 
  deleteTransacao 
} = useFinancasPessoais();
```

### `useMetasPessoais()`
Gerenciamento de metas mensais.

```typescript
const { meta, isLoading, fetchMeta, upsertMeta } = useMetasPessoais();
```

## 🎨 Componentes UI

### `<ModeSwitch />`
Toggle segmented control para alternar entre modos.
- Ícones: Briefcase (Profissional) / Wallet (Pessoal)
- Acessível (ARIA)

### `<DashboardPessoal />`
Dashboard principal do modo Pessoal.
- Cards de resumo (Entradas, Saídas, Saldo, Meta)
- Gráficos de evolução e categorias
- Tabela de transações
- Botão para nova transação

### Componentes Auxiliares
- `<TransacaoDialog />`: Form para criar/editar transações
- `<TransacoesTable />`: Tabela com histórico
- `<GraficoEvolucao />`: Gráfico de barras (últimos 6 meses)
- `<GraficoCategorias />`: Gráfico de pizza (gastos por categoria)

## 📊 Funções de Dados (`lib/data/pessoal.ts`)

```typescript
// Resumo do mês
getResumoPessoal(userId, ano, mes): Promise<ResumoPessoal>

// Listar com filtros
listTransacoes(userId, filters): Promise<TransacaoPessoal[]>

// Gastos por categoria
getGastosPorCategoria(userId, ano, mes): Promise<{categoria, total}[]>

// Evolução mensal
getEvolucaoMensal(userId): Promise<{mes, entradas, saidas}[]>
```

## 🔒 Validação

Schemas Zod em `types/venlo-mode.ts`:

```typescript
transacaoPessoalSchema: {
  tipo: 'entrada' | 'saida',
  categoria: string (min 2),
  descricao?: string,
  valor: number (>= 0),
  data: string (YYYY-MM-DD)
}

metaPessoalSchema: {
  ano: number (2020-2100),
  mes: number (1-12),
  meta_economia: number (>= 0)
}
```

## 🚀 Deploy

### 1. Aplicar Migration
```bash
# Supabase CLI
supabase db push

# Ou via Dashboard
# SQL Editor → Executar migration
```

### 2. Build & Deploy
```bash
npm run build
netlify deploy --prod
```

### 3. Verificar RLS
```sql
-- Testar políticas
SELECT * FROM financas_pessoais; -- Deve retornar apenas dados do usuário logado
```

## 📈 Analytics

Eventos rastreados (Google Analytics):
- `mode_switch`: Quando usuário alterna modo
- `tx_created`: Quando cria transação
- `goal_updated`: Quando atualiza meta

## 🧪 Testes

### Checklist Manual
- [ ] Alternar entre modos persiste após reload
- [ ] Criar transação de entrada
- [ ] Criar transação de saída
- [ ] Editar transação existente
- [ ] Deletar transação
- [ ] Definir meta mensal
- [ ] Gráficos renderizam corretamente
- [ ] Filtros de transações funcionam
- [ ] RLS impede acesso a dados de outros usuários

### Teste de RLS
```sql
-- Como usuário A
INSERT INTO financas_pessoais (user_id, tipo, categoria, valor, data)
VALUES ('user-b-id', 'entrada', 'Teste', 100, '2025-01-21');
-- Deve falhar (violação de RLS)
```

## 🎯 Categorias Predefinidas

### Entradas
- Salário
- Freelance
- Investimentos
- Presente
- Reembolso
- Outros

### Saídas
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Contas
- Investimentos
- Outros

## 🔧 Configuração

### Feature Flag (opcional)
```typescript
// .env.local
NEXT_PUBLIC_ENABLE_PERSONAL_FINANCE=true
```

### Internacionalização
Todos os textos estão em pt-BR. Para adicionar i18n:
1. Extrair strings para `locales/pt-BR.json`
2. Usar `next-intl` ou similar

## 📝 Notas de Implementação

- **Modo default**: PROFISSIONAL
- **Persistência**: localStorage (primário) + cookie (fallback)
- **Validação**: Client-side (Zod) + Server-side (API)
- **Performance**: Índices no banco para queries rápidas
- **UX**: Loading states, toasts de feedback, animações suaves

## 🐛 Troubleshooting

### Modo não persiste
- Verificar localStorage e cookies habilitados
- Limpar cache do navegador

### Transações não aparecem
- Verificar RLS policies
- Conferir user_id na sessão

### Erro 401 nas APIs
- Sessão expirada → fazer login novamente
- Verificar cookies de autenticação

## 📚 Referências

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod Validation](https://zod.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Versão**: 1.0.0  
**Data**: 21/01/2025  
**Autor**: Venlo Team
