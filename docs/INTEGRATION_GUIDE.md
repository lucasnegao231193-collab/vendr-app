# Guia de Integração - Painel Venlo

## 📋 Checklist de Integração

### 1. Aplicar Migration no Supabase

```bash
# Via Supabase CLI
supabase db push

# Ou copiar o conteúdo de:
# supabase/migrations/20250121_financas_pessoais.sql
# E executar no SQL Editor do Supabase Dashboard
```

### 2. Instalar Dependências (se necessário)

```bash
npm install recharts
# ou
yarn add recharts
```

### 3. Integrar na Página Solo Existente

Você tem duas opções:

#### Opção A: Nova Rota `/painel-venlo`

Já criada em `app/painel-venlo/page.tsx`. Basta:

1. Adicionar link no menu de navegação
2. Importar o dashboard profissional existente
3. Testar a alternância de modos

#### Opção B: Modificar `/solo` Existente

Editar `app/solo/page.tsx`:

```typescript
import { useVenloMode } from '@/hooks/useVenloMode';
import { ModeSwitch } from '@/components/painel/ModeSwitch';
import { DashboardPessoal } from '@/components/painel/DashboardPessoal';

export default function SoloPage() {
  const { mode } = useVenloMode();

  return (
    <div className="space-y-6">
      {/* Adicionar ModeSwitch no topo */}
      <div className="flex items-center justify-between">
        <h1>Dashboard Solo</h1>
        <ModeSwitch />
      </div>

      {/* Renderizar baseado no modo */}
      {mode === 'PROFISSIONAL' ? (
        // Dashboard existente
        <ExistingSoloDashboard />
      ) : (
        // Novo dashboard pessoal
        <DashboardPessoal />
      )}
    </div>
  );
}
```

### 4. Atualizar Menu de Navegação

Editar `components/SoloSidebar.tsx` (ou equivalente):

```typescript
const menuItems = [
  // ... itens existentes
  {
    label: 'Painel Venlo',
    href: '/painel-venlo',
    icon: Wallet,
  },
];
```

### 5. Testar Localmente

```bash
# 1. Iniciar servidor de desenvolvimento
npm run dev

# 2. Acessar
http://localhost:3000/painel-venlo
# ou
http://localhost:3000/solo

# 3. Testar:
# - Alternar entre modos
# - Criar transação
# - Verificar gráficos
# - Definir meta
# - Deletar transação
```

## 🧪 Testes Essenciais

### Teste 1: Persistência do Modo

```
1. Selecionar modo "Pessoal"
2. Recarregar página (F5)
3. ✅ Deve manter modo "Pessoal"
```

### Teste 2: CRUD de Transações

```
1. Clicar em "Nova Transação"
2. Preencher formulário
3. Salvar
4. ✅ Transação deve aparecer na tabela
5. Editar transação
6. ✅ Mudanças devem ser salvas
7. Deletar transação
8. ✅ Transação deve sumir
```

### Teste 3: Gráficos

```
1. Criar algumas transações
2. ✅ Gráfico de evolução deve atualizar
3. ✅ Gráfico de categorias deve mostrar distribuição
```

### Teste 4: Metas

```
1. Definir meta de R$ 1000
2. Criar transações
3. ✅ Card "Meta" deve mostrar percentual atingido
```

### Teste 5: RLS (Segurança)

```
1. Fazer login com usuário A
2. Criar transações
3. Fazer logout
4. Fazer login com usuário B
5. ✅ Não deve ver transações do usuário A
```

## 🔧 Ajustes Necessários

### 1. Importar Dashboard Profissional

Em `app/painel-venlo/page.tsx`, substituir:

```typescript
// De:
<div className="rounded-lg border border-dashed p-12 text-center">
  <p>Dashboard Profissional (importar componente existente)</p>
</div>

// Para:
import { SoloDashboard } from '@/components/solo/SoloDashboard'; // Ajustar caminho

<SoloDashboard />
```

### 2. Ajustar Tema/Cores (opcional)

Se quiser manter consistência visual:

```typescript
// Em components/painel/DashboardPessoal.tsx
// Ajustar cores dos cards para combinar com o tema existente
```

### 3. Adicionar Feature Flag (opcional)

```typescript
// .env.local
NEXT_PUBLIC_ENABLE_PERSONAL_FINANCE=true

// Em app/painel-venlo/page.tsx
if (process.env.NEXT_PUBLIC_ENABLE_PERSONAL_FINANCE !== 'true') {
  return <NotFound />;
}
```

## 📊 Estrutura de Arquivos Criados

```
windsurf-project/
├── app/
│   ├── api/
│   │   └── pessoal/
│   │       ├── transacoes/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── meta/route.ts
│   └── painel-venlo/
│       └── page.tsx
├── components/
│   └── painel/
│       ├── ModeSwitch.tsx
│       ├── DashboardPessoal.tsx
│       ├── TransacaoDialog.tsx
│       ├── TransacoesTable.tsx
│       ├── GraficoEvolucao.tsx
│       └── GraficoCategorias.tsx
├── hooks/
│   ├── useVenloMode.ts
│   ├── useFinancasPessoais.ts
│   ├── useMetasPessoais.ts
│   └── useAuth.ts
├── lib/
│   └── data/
│       └── pessoal.ts
├── types/
│   └── venlo-mode.ts
├── supabase/
│   └── migrations/
│       └── 20250121_financas_pessoais.sql
└── docs/
    ├── PERSONAL_FINANCE.md
    └── INTEGRATION_GUIDE.md
```

## 🐛 Troubleshooting

### Erro: "Cannot find module recharts"

```bash
npm install recharts
```

### Erro: "useAuth is not defined"

O hook `useAuth` foi criado em `hooks/useAuth.ts`. Certifique-se de que está importado corretamente.

### Erro: RLS Policy Violation

Verifique se a migration foi aplicada corretamente:

```sql
-- No Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename IN ('financas_pessoais', 'metas_pessoais');
```

### Gráficos não renderizam

1. Verificar se `recharts` está instalado
2. Verificar console do navegador para erros
3. Verificar se há dados nas transações

### Modo não persiste

1. Verificar localStorage no DevTools
2. Verificar cookies
3. Limpar cache do navegador

## 🚀 Próximos Passos

Após integração básica funcionar:

1. [ ] Adicionar filtros avançados na tabela
2. [ ] Implementar exportação para Excel/CSV
3. [ ] Adicionar notificações quando atingir meta
4. [ ] Criar relatórios mensais automáticos
5. [ ] Implementar categorias personalizadas
6. [ ] Adicionar anexos (fotos de notas fiscais)
7. [ ] Criar dashboard de comparação ano a ano

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do console do navegador
2. Verificar logs do Supabase
3. Revisar a documentação em `docs/PERSONAL_FINANCE.md`
4. Verificar se todas as dependências estão instaladas

---

**Boa sorte com a integração! 🎉**
