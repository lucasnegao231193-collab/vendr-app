# 📦 MÓDULO TRANSFERÊNCIAS - IMPLEMENTAÇÃO COMPLETA

**Status:** ✅ **70% Implementado**  
**Restante:** Componentes frontend + Realtime + Offline Queue + Testes

---

## ✅ JÁ IMPLEMENTADO

### 1. Migrações SQL ✅
- **Arquivo:** `supabase-transferencias-migration.sql`
- Tabelas: `vendedor_estoque`, `transferencias`, `transferencia_itens`, `devolucoes`, `devolucao_itens`, `estoque_logs`
- RLS Policies: 15 políticas criadas
- Índices de performance
- Triggers `updated_at`

### 2. APIs Completas ✅ (8 endpoints)
1. **POST /api/transferencias/create** - Criar transferência (empresa → vendedor)
2. **GET /api/transferencias/empresa** - Listar transferências da empresa
3. **GET /api/transferencias/vendedor** - Listar pendentes do vendedor
4. **POST /api/transferencias/[id]/aceitar** - Vendedor aceita
5. **POST /api/transferencias/[id]/recusar** - Vendedor recusa
6. **POST /api/devolucoes/create** - Vendedor solicita devolução
7. **GET /api/devolucoes/empresa** - Listar devoluções pendentes
8. **POST /api/devolucoes/[id]/aceitar** - Empresa aceita devolução
9. **POST /api/devolucoes/[id]/recusar** - Empresa recusa

### 3. Páginas Frontend (1/4)
- ✅ `/empresa/transferencias/page.tsx` - Página principal da empresa

---

## 🔨 ARQUIVOS RESTANTES A CRIAR

### A) Componentes Reutilizáveis (Prioridade 1)

#### `components/transferencias/TransferForm.tsx`
Formulário para criar transferência (empresa):
- Select vendedor com busca
- Select produto + quantidade
- Carrinho de itens
- Campo observação
- Validação de estoque
- Submit para API

#### `components/transferencias/TransferList.tsx`
Tabela de transferências:
- Colunas: ID, Vendedor, Status, Total Itens, Data, Ações
- Filtro por status
- Paginação
- Modal de detalhes
- Ações: Ver, Cancelar (se pendente)

#### `components/transferencias/ReceivedTransferCard.tsx`
Card para vendedor visualizar transferência recebida:
- Header com empresa e data
- Lista de itens (produto, qtd, preço)
- Observação
- Botões: Aceitar / Recusar
- Modal de confirmação

#### `components/transferencias/VendedorStockList.tsx`
Lista de estoque do vendedor:
- Tabela: Produto, SKU, Quantidade, Última Atualização
- Botão "Solicitar Devolução" por item
- Filtro e busca
- Badge de quantidade baixa

#### `components/transferencias/ReturnRequestForm.tsx`
Formulário de solicitação de devolução (vendedor):
- Select produto do estoque do vendedor
- Input quantidade (validar disponível)
- Observação/motivo
- Preview dos itens selecionados
- Submit para API

#### `components/transferencias/DevolucaoList.tsx`
Lista de devoluções para empresa:
- Tabela: ID, Vendedor, Itens, Data, Status
- Filtro por status
- Ações: Ver Detalhes, Aceitar, Recusar
- Modal de confirmação

---

### B) Páginas Frontend Restantes (Prioridade 2)

#### `app/empresa/devolucoes/page.tsx`
Página de devoluções da empresa:
```tsx
- Header com stats (pendentes, aceitas, recusadas)
- Component <DevolucaoList />
- Realtime updates quando vendedor solicita
- Modal de aceite/recusa com motivo
```

#### `app/vendedor/transferencias-recebidas/page.tsx`
Página do vendedor para aceitar/recusar transferências:
```tsx
- Lista de cards <ReceivedTransferCard />
- Contador de pendentes
- Filtro: Pendentes / Histórico
- Toast de notificação quando empresa envia
- Offline queue integration
```

#### `app/vendedor/estoque/page.tsx`
Página de estoque do vendedor:
```tsx
- Component <VendedorStockList />
- Stats: Total de itens, Valor total
- Botão "Solicitar Devolução" global
- Histórico de transferências aceitas
- Link para transferências pendentes
```

---

### C) Supabase Realtime (Prioridade 2)

#### `hooks/useTransferenciasRealtime.ts`
Hook customizado para notificações realtime:
```typescript
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export function useTransferenciasRealtime(empresaId: string, onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`transferencias_empresa_${empresaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transferencias',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload) => {
          console.log('Transferência atualizada:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId, onUpdate]);
}
```

#### `hooks/useDevolucoesRealtime.ts`
Similar ao acima para devoluções.

#### `hooks/useVendedorNotifications.ts`
Notificações para vendedor:
```typescript
// Ouvir novos envios
// Mostrar toast quando empresa envia transferência
// Badge de contador no TopBar
```

---

### D) Offline Queue (Prioridade 3)

#### `store/transferenciasQueue.ts`
Zustand store para fila offline:
```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface TransferenciaQueueItem {
  id: string;
  type: 'aceitar' | 'recusar';
  transferenciaId: string;
  data: any;
  timestamp: number;
}

interface TransferenciaQueueStore {
  queue: TransferenciaQueueItem[];
  addToQueue: (item: Omit<TransferenciaQueueItem, 'id' | 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => Promise<void>;
  isProcessing: boolean;
}

export const useTransferenciaQueue = create<TransferenciaQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isProcessing: false,
      
      addToQueue: (item) => {
        const newItem: TransferenciaQueueItem = {
          ...item,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set((state) => ({ queue: [...state.queue, newItem] }));
      },
      
      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },
      
      processQueue: async () => {
        const { queue } = get();
        if (queue.length === 0 || get().isProcessing) return;
        
        set({ isProcessing: true });
        
        for (const item of queue) {
          try {
            const endpoint = item.type === 'aceitar' 
              ? `/api/transferencias/${item.transferenciaId}/aceitar`
              : `/api/transferencias/${item.transferenciaId}/recusar`;
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            });
            
            if (response.ok) {
              get().removeFromQueue(item.id);
            }
          } catch (error) {
            console.error('Erro ao processar item da fila:', error);
            // Manter na fila para tentar depois
          }
        }
        
        set({ isProcessing: false });
      },
    }),
    {
      name: 'transferencias-queue',
    }
  )
);
```

---

### E) Testes (Opcional mas Recomendado)

#### `__tests__/api/transferencias.test.ts`
```typescript
describe('POST /api/transferencias/create', () => {
  it('deve criar transferência com estoque suficiente', async () => {
    // Mock autenticação
    // Mock estoque disponível
    // Chamar API
    // Validar resposta e banco
  });
  
  it('deve retornar erro se estoque insuficiente', async () => {
    // ...
  });
});
```

#### `__tests__/integration/fluxo-transferencia.test.ts`
```typescript
describe('Fluxo completo de transferência', () => {
  it('empresa envia → vendedor aceita → estoque atualizado', async () => {
    // 1. Empresa cria transferência
    // 2. Verificar estoque empresa debitado
    // 3. Vendedor aceita
    // 4. Verificar estoque vendedor creditado
    // 5. Verificar logs criados
  });
});
```

---

## 📋 PLANO DE FINALIZAÇÃO

### Fase 1: Componentes Core (2-3h)
1. TransferForm.tsx
2. TransferList.tsx
3. ReceivedTransferCard.tsx
4. VendedorStockList.tsx
5. ReturnRequestForm.tsx
6. DevolucaoList.tsx

### Fase 2: Páginas Restantes (1h)
1. /empresa/devolucoes
2. /vendedor/transferencias-recebidas
3. /vendedor/estoque

### Fase 3: Realtime (1h)
1. useTransferenciasRealtime
2. useDevolucoesRealtime
3. useVendedorNotifications
4. Integrar nas páginas

### Fase 4: Offline Queue (1h)
1. transferenciasQueue.ts
2. Integrar no ReceivedTransferCard
3. Auto-sync ao reconectar
4. UI de status de sincronização

### Fase 5: Testes & Docs (1h)
1. Testes de API
2. Teste E2E do fluxo
3. README com instruções
4. Screenshots/GIFs

**Total estimado: 6-7 horas**

---

## 🚀 COMANDOS PARA EXECUTAR

### 1. Executar Migração SQL
```sql
-- No Supabase SQL Editor de PRODUÇÃO:
-- Copiar e executar: supabase-transferencias-migration.sql
```

### 2. Testar APIs Localmente
```bash
npm run dev

# Testar criar transferência (empresa):
curl -X POST http://localhost:3000/api/transferencias/create \
  -H "Content-Type: application/json" \
  -d '{
    "vendedorId": "uuid-do-vendedor",
    "itens": [{"produtoId": "uuid-produto", "quantidade": 10}],
    "observacao": "Teste"
  }'

# Listar transferências:
curl http://localhost:3000/api/transferencias/empresa

# Aceitar transferência (vendedor):
curl -X POST http://localhost:3000/api/transferencias/{id}/aceitar
```

### 3. Verificar Build
```bash
npm run build
```

### 4. Criar Branch e PR
```bash
git checkout -b feature/transferencias-estoque
git add .
git commit -m "feat: módulo completo de transferências de estoque

- Migrações SQL (5 tabelas + RLS)
- 9 endpoints API com transações atômicas
- Páginas empresa e vendedor
- Componentes reutilizáveis
- Supabase Realtime notifications
- Offline queue com Zustand
- Testes automatizados
- Documentação completa"

git push origin feature/transferencias-estoque
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de fazer PR, validar:

**Backend:**
- [ ] Migração SQL executada sem erros
- [ ] 9 endpoints retornam 200/201 em testes
- [ ] RLS impede acesso não autorizado
- [ ] Logs criados em todas operações
- [ ] Transações atômicas funcionando (rollback em erro)

**Frontend:**
- [ ] Empresa cria transferência com sucesso
- [ ] Vendedor vê transferências pendentes
- [ ] Aceitar adiciona ao estoque do vendedor
- [ ] Recusar devolve ao estoque da empresa
- [ ] Devolução aceita move itens corretamente
- [ ] Notificações realtime funcionando
- [ ] Offline queue sincroniza ao reconectar

**UX:**
- [ ] Loading states em todos fetches
- [ ] Toast de sucesso/erro em todas ações
- [ ] Validação de formulários
- [ ] Responsivo mobile
- [ ] Acessibilidade (aria-labels, keyboard nav)

---

## 📊 MÉTRICAS DO PROJETO

| Item | Quantidade |
|------|------------|
| **Tabelas criadas** | 5 |
| **RLS Policies** | 15 |
| **API Endpoints** | 9 |
| **Páginas Frontend** | 4 |
| **Componentes** | 6 |
| **Hooks Customizados** | 3 |
| **Stores Zustand** | 1 |
| **Linhas de código** | ~4.500 |

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar componentes da lista acima** (TransferForm, etc)
2. **Testar fluxo completo** manualmente
3. **Executar `npm run verify:site`**
4. **Commit e push**
5. **Abrir PR** com descrição detalhada

---

**Criado em:** 2025-10-09  
**Branch:** `feature/transferencias-estoque`  
**Status:** 70% Completo (APIs + SQL + 1 página)
