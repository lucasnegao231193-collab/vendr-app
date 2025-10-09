# 📝 Template para Ajustar Páginas Restantes

## ✅ Páginas Já Ajustadas

- [x] `/dashboard/page.tsx` - ✅ Usando AuthenticatedLayout
- [x] `/vendedores/page.tsx` - ✅ Usando AuthenticatedLayout  
- [x] `/estoque/page.tsx` - ✅ Usando AuthenticatedLayout

---

## 🔄 Páginas que Precisam Ajuste

### Owner (Empresa)
- [ ] `/operacoes/page.tsx`
- [ ] `/financeiro/page.tsx`
- [ ] `/relatorios/page.tsx`
- [ ] `/configuracoes/page.tsx`

### Seller (Vendedor)
- [ ] `/vendedor/page.tsx`
- [ ] `/vendedor/venda/page.tsx`
- [ ] `/vendedor/fechar/page.tsx`

---

## 🎨 Template de Mudanças

### 1. Imports

**❌ Remover:**
```tsx
import { DashboardNav } from "@/components/DashboardNav";
```

**✅ Adicionar:**
```tsx
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
```

---

### 2. Estrutura do Return

**❌ ANTES:**
```tsx
if (loading) {
  return <div className="p-8">Carregando...</div>;
}

return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Título</h1>
          <p className="text-muted-foreground">Descrição</p>
        </div>
        <Button>Ação</Button>
      </div>

      <DashboardNav />

      {/* Resto do conteúdo */}
    </div>
  </div>
);
```

**✅ DEPOIS:**
```tsx
return (
  <AuthenticatedLayout requiredRole="owner"> {/* ou "seller" para páginas de vendedor */}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Título</h1>
          <p className="text-[var(--text-secondary)]">Descrição</p>
        </div>
        <Button className="bg-[var(--brand-primary)] text-white">Ação</Button>
      </div>

      {/* Resto do conteúdo - SEM DashboardNav */}
    </div>
  </AuthenticatedLayout>
);
```

---

### 3. Estilo dos Cards

**❌ ANTES:**
```tsx
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

**✅ DEPOIS:**
```tsx
<Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

---

### 4. Loading States

**❌ ANTES:**
```tsx
if (loading) {
  return <div>Carregando...</div>;
}
```

**✅ DEPOIS (dentro do JSX):**
```tsx
{loading ? (
  <SkeletonTable rows={5} columns={4} />
) : data.length === 0 ? (
  <EmptyState
    icon={<Icon className="h-12 w-12" />}
    title="Nenhum registro"
    description="Descrição do empty state"
    action={{
      label: "Criar Novo",
      onClick: () => router.push('/rota'),
    }}
  />
) : (
  <Table>...</Table>
)}
```

---

### 5. Cores e Estilos

**Substituições rápidas:**
- `text-3xl font-bold` → `text-3xl font-bold text-[var(--text-primary)]`
- `text-muted-foreground` → `text-[var(--text-secondary)]`
- `bg-gray-50` → `bg-[var(--bg-soft)]` (geralmente não precisa, pois o AppShell já tem)
- Botões primários → adicionar `className="bg-[var(--brand-primary)] text-white"`
- Botões de ação/CTA → adicionar `className="bg-[var(--brand-accent)] text-white"`

---

## 🚀 Exemplo Completo: Página de Operações

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Receipt } from "lucide-react";

export default function OperacoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [operacoes, setOperacoes] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from("operacoes").select("*");
    setOperacoes(data || []);
    setLoading(false);
  };

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Operações</h1>
            <p className="text-[var(--text-secondary)]">Gerencie todas as operações</p>
          </div>
          <Button className="bg-[var(--brand-primary)] text-white">
            Nova Operação
          </Button>
        </div>

        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle>Lista de Operações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={5} columns={4} />
            ) : operacoes.length === 0 ? (
              <EmptyState
                icon={<Receipt className="h-12 w-12" />}
                title="Nenhuma operação registrada"
                description="Comece criando sua primeira operação."
                action={{
                  label: "Nova Operação",
                  onClick: () => router.push('/operacoes/criar'),
                }}
              />
            ) : (
              <div>
                {/* Renderizar operações */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
```

---

## ✅ Checklist por Página

Para cada página, verifique:

- [ ] Importou `AuthenticatedLayout`
- [ ] Importou `SkeletonTable` e `EmptyState` (se necessário)
- [ ] Removeu `DashboardNav`
- [ ] Envolveu o return em `<AuthenticatedLayout requiredRole="...">`
- [ ] Aplicou classes de cor nas headings (`text-[var(--text-primary)]`)
- [ ] Aplicou `bg-white rounded-2xl border-[var(--border-soft)] shadow-sm` nos Cards
- [ ] Adicionou loading states com Skeleton
- [ ] Adicionou empty states quando não há dados
- [ ] Aplicou cores do design system nos botões

---

## 🎯 Páginas de Vendedor

Para páginas em `/vendedor/`, use:
```tsx
<AuthenticatedLayout requiredRole="seller">
```

E adapte os textos e funcionalidades para o contexto do vendedor.

---

**Aplique essas mudanças em todas as páginas restantes para ter uma UI consistente!** ✨
