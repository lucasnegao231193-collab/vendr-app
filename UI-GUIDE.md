# 🎨 Vendr - Guia da Nova UI

## 📋 Visão Geral

A nova interface do Vendr foi completamente reformulada com foco em:
- **Modernidade**: Design system consistente com Tailwind CSS
- **Acessibilidade**: Navegação por teclado, foco visível, ARIA labels
- **Responsividade**: Layout adaptativo (mobile-first)
- **Suporte**: WhatsApp integrado em toda a plataforma
- **Interatividade**: Skeletons, empty states, toasts, confirmações

---

## 🎨 Design System

### Cores (CSS Variables)

```css
--brand-primary: #0057FF;   /* Azul principal */
--brand-accent: #FF6B00;    /* Laranja para CTAs */
--bg-soft: #F5F6F8;         /* Fundo suave */
--text-primary: #1F2937;    /* Texto principal */
--text-secondary: #4B5563;  /* Texto secundário */
--border-soft: #E5E7EB;     /* Bordas suaves */
--success: #16A34A;         /* Verde sucesso */
--warning: #F59E0B;         /* Amarelo aviso */
--danger: #DC2626;          /* Vermelho perigo */
```

### Componentes Base

- **Cards**: `bg-white rounded-2xl border-[var(--border-soft)] shadow-sm`
- **Botão Primário**: `bg-[var(--brand-primary)] text-white rounded-2xl`
- **Botão Accent**: `bg-[var(--brand-accent)] text-white`
- **Pill Ativo**: `bg-[var(--brand-primary)] text-white rounded-2xl`
- **Pill Inativo**: `bg-white border border-[var(--border-soft)] text-[var(--text-secondary)]`

---

## 🏗️ Arquitetura de Layout

### AppShell

O `AppShell` é o container principal que envolve todas as páginas autenticadas:

```tsx
<AppShell role="owner" userName="Nome do Usuário">
  {/* Conteúdo da página */}
</AppShell>
```

**Componentes do AppShell:**
- **TopBar** (fixo no topo)
- **SideNav** (desktop ≥1024px)
- **BottomNav** (mobile <1024px)
- **Breadcrumbs** (trilha de navegação)
- **FloatingWhatsApp** (botão flutuante)

### AuthenticatedLayout

Wrapper que verifica autenticação e aplica o AppShell:

```tsx
<AuthenticatedLayout requiredRole="owner">
  {/* Conteúdo da página */}
</AuthenticatedLayout>
```

---

## 🧭 Navegação

### Botão Voltar

Implementado com fallback baseado em role:

```tsx
import { navigateBack } from "@/lib/navigation";

const handleBack = () => {
  navigateBack(router, role);
};
```

**Comportamento:**
- Se há histórico: `router.back()`
- Se não há histórico:
  - Owner → `/dashboard`
  - Seller → `/vendedor`

### Botão Início (Home)

```tsx
import { navigateHome } from "@/lib/navigation";

const handleHome = () => {
  navigateHome(router, role);
};
```

### Itens de Navegação

**Owner (SideNav/BottomNav):**
- Dashboard
- Vendedores
- Estoque
- Operações
- Financeiro
- Relatórios
- Configurações
- Suporte

**Seller (BottomNav + FAB):**
- Início
- Nova Venda (FAB)
- Fechar Dia
- Suporte

---

## 💬 Suporte via WhatsApp

### Configuração

Em `.env.local`:

```env
NEXT_PUBLIC_SUPPORT_WHATSAPP=+5511999999999
NEXT_PUBLIC_SUPPORT_MESSAGE_OWNER=Olá! Sou empresa e preciso de ajuda no Vendr.
NEXT_PUBLIC_SUPPORT_MESSAGE_SELLER=Olá! Sou vendedor e preciso de ajuda no Vendr.
```

### Uso Programático

```tsx
import { openWhatsApp, getContextualMessage } from "@/lib/whatsapp";

const handleSupport = () => {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '+5511999999999';
  const message = getContextualMessage(role, pathname);
  
  openWhatsApp(phone, message);
};
```

**Locais de Acesso ao Suporte:**
1. **FloatingWhatsApp** (canto inferior direito)
2. **TopBar** → Botão "Suporte" (laranja)
3. **SideNav** → Item "Suporte"
4. **User Menu** → "Suporte" (mobile)

---

## 🔧 Componentes Auxiliares

### EmptyState

```tsx
import { EmptyState } from "@/components/ui/EmptyState";

<EmptyState
  icon={<ShoppingCart className="h-12 w-12" />}
  title="Nenhuma venda registrada"
  description="As vendas aparecerão aqui."
  action={{
    label: "Criar Venda",
    onClick: () => router.push('/vendedor/venda'),
  }}
/>
```

### SkeletonTable

```tsx
import { SkeletonTable } from "@/components/ui/SkeletonTable";

{loading ? (
  <SkeletonTable rows={5} columns={4} />
) : (
  <Table>...</Table>
)}
```

### ConfirmDialog

```tsx
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  open={showConfirm}
  onOpenChange={setShowConfirm}
  title="Excluir Vendedor?"
  description="Esta ação não pode ser desfeita."
  confirmLabel="Excluir"
  cancelLabel="Cancelar"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

### Breadcrumbs

Gerado automaticamente a partir do pathname:

```tsx
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

<Breadcrumbs />
// Resultado: Início > Dashboard > Vendedores
```

---

## 📱 Responsividade

### Breakpoints

- **Mobile**: < 1024px → BottomNav + FAB (sellers)
- **Desktop**: ≥ 1024px → SideNav

### Classes Tailwind

```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
className="hidden lg:flex"  // Desktop only
className="lg:hidden"        // Mobile only
```

---

## ♿ Acessibilidade

### ARIA Labels

```tsx
<button aria-label="Voltar">
  <ArrowLeft />
</button>

<button aria-label="Suporte via WhatsApp">
  <MessageCircle />
</button>
```

### Foco Visível

Todos os elementos interativos têm:

```css
focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2
```

### Contraste

Todas as cores seguem WCAG AA (4.5:1 para texto normal).

---

## 🎯 Exemplo de Página Completa

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Users } from "lucide-react";

export default function MinhaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: result } = await supabase.from("minha_tabela").select("*");
    setData(result || []);
    setLoading(false);
  };

  return (
    <AuthenticatedLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Minha Página
            </h1>
            <p className="text-[var(--text-secondary)]">Descrição</p>
          </div>
          <Button
            onClick={() => router.push('/criar')}
            className="bg-[var(--brand-primary)] text-white"
          >
            Criar Novo
          </Button>
        </div>

        {/* Conteúdo */}
        <Card className="bg-white rounded-2xl border-[var(--border-soft)] shadow-sm">
          <CardHeader>
            <CardTitle>Título do Card</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={5} columns={3} />
            ) : data.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title="Nenhum registro encontrado"
                description="Clique em 'Criar Novo' para começar."
                action={{
                  label: "Criar Novo",
                  onClick: () => router.push('/criar'),
                }}
              />
            ) : (
              <div>{/* Renderizar dados */}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
```

---

## 🚀 Próximos Passos

1. **Configurar `.env.local`** com número do WhatsApp
2. **Testar navegação** (Voltar, Início, Links)
3. **Testar suporte** (FloatingWhatsApp, TopBar, SideNav)
4. **Verificar responsividade** (mobile e desktop)
5. **Testar acessibilidade** (foco, keyboard navigation)

---

## 📝 Checklist de Implementação

- [x] Design system (cores, estilos)
- [x] AppShell (TopBar, SideNav, BottomNav)
- [x] WhatsApp integration
- [x] AuthenticatedLayout
- [x] Componentes auxiliares (EmptyState, Skeleton, ConfirmDialog)
- [x] Dashboard reformulado
- [ ] Ajustar páginas restantes (Vendedores, Estoque, etc)
- [ ] Testes de navegação
- [ ] Testes de responsividade
- [ ] Testes de acessibilidade

---

## 🆘 Troubleshooting

### WhatsApp não abre

Verifique `.env.local`:
```env
NEXT_PUBLIC_SUPPORT_WHATSAPP=+5511999999999
```

### Redirecionamento infinito

Verifique se a tabela `perfis` tem o `role` correto:
```sql
SELECT user_id, role FROM perfis;
```

### Layout quebrado no mobile

Verifique se `BottomNav` e `FloatingWhatsApp` estão renderizando:
```tsx
<BottomNav role={role} />
<FloatingWhatsApp role={role} />
```

---

**Desenvolvido com ❤️ usando Next.js 14 + Tailwind + shadcn/ui**
