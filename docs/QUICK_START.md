# 🚀 Quick Start - Painel Venlo

## ⚡ Início Rápido (5 minutos)

### 1. Aplicar Migration

Copie e execute no **Supabase SQL Editor**:

```sql
-- Arquivo: supabase/migrations/20250121_financas_pessoais.sql
-- (Copiar todo o conteúdo do arquivo)
```

### 2. Instalar Dependência

```bash
npm install recharts
```

### 3. Testar

```bash
npm run dev
```

Acesse: `http://localhost:3000/painel-venlo`

### 4. Testar Funcionalidades

✅ Alternar entre Profissional/Pessoal  
✅ Criar uma transação de entrada  
✅ Criar uma transação de saída  
✅ Ver gráficos atualizarem  
✅ Definir uma meta  
✅ Recarregar página (modo deve persistir)  

## 📁 Arquivos Principais

```
✅ Migration SQL: supabase/migrations/20250121_financas_pessoais.sql
✅ Tipos: types/venlo-mode.ts
✅ Hooks: hooks/useVenloMode.ts, useFinancasPessoais.ts, useMetasPessoais.ts
✅ API: app/api/pessoal/transacoes/route.ts, meta/route.ts
✅ Componentes: components/painel/*
✅ Página: app/painel-venlo/page.tsx
```

## 🎯 Próximo Passo

Integrar na página Solo existente:

```typescript
// app/solo/page.tsx
import { ModeSwitch } from '@/components/painel/ModeSwitch';
import { DashboardPessoal } from '@/components/painel/DashboardPessoal';
import { useVenloMode } from '@/hooks/useVenloMode';

// Adicionar <ModeSwitch /> no header
// Renderizar <DashboardPessoal /> quando mode === 'PESSOAL'
```

## 📚 Documentação Completa

- **Detalhes técnicos**: `docs/PERSONAL_FINANCE.md`
- **Guia de integração**: `docs/INTEGRATION_GUIDE.md`

## ✅ Checklist

- [ ] Migration aplicada no Supabase
- [ ] `npm install recharts` executado
- [ ] `npm run dev` funcionando
- [ ] `/painel-venlo` acessível
- [ ] Transações sendo criadas
- [ ] Gráficos renderizando
- [ ] Modo persistindo após reload

---

**Tudo pronto! Agora é só integrar na página Solo. 🎉**
