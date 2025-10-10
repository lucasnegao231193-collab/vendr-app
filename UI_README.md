# 🎨 VENDR UI V2 - Guia de Design System

**Última atualização:** 2025-10-09  
**Versão:** 2.0

---

## 📐 **TEMA DE CORES**

### **Cores Principais**
```css
--color-primary: #0A66FF      /* Azul vibrante - Ações principais */
--color-secondary: #FF6B00    /* Laranja - CTAs importantes */
--color-accent: #22C55E       /* Verde - Sucesso */
--color-warning: #F59E0B      /* Amarelo - Avisos */
--color-danger: #EF4444       /* Vermelho - Erros */
--color-bg: #F5F7FB           /* Fundo suave */
--color-card: #FFFFFF         /* Cards */
--color-muted: #6B7280        /* Texto secundário */
```

### **Como Usar as Cores**

#### **Botões:**
```tsx
// Botão primário (azul)
<Button className="bg-primary hover:bg-primary/90">
  Salvar
</Button>

// Botão CTA (laranja)
<Button className="bg-secondary hover:bg-secondary/90">
  Criar Novo
</Button>

// Botão outline
<Button variant="outline">
  Cancelar
</Button>
```

#### **Badges:**
```tsx
// Sucesso
<Badge className="bg-accent/10 text-accent">Ativo</Badge>

// Aviso
<Badge className="bg-warning/10 text-warning">Pendente</Badge>

// Erro
<Badge className="bg-destructive/10 text-destructive">Inativo</Badge>
```

#### **Cards:**
```tsx
// Card simples
<Card className="shadow-md">
  <CardContent>...</CardContent>
</Card>

// Card com borda colorida
<Card className="border-l-4 border-l-primary shadow-md">
  <CardContent>...</CardContent>
</Card>
```

---

## 🔤 **TIPOGRAFIA**

### **Fontes**
- **Outfit** (600/700) → Títulos e headings
- **Inter** (400/500/600) → UI e texto

### **Como Usar**

```tsx
// Título grande (usa Outfit automaticamente)
<h1 className="text-3xl font-bold tracking-tight">
  Título Principal
</h1>

// Forçar fonte Outfit
<div className="font-heading">
  Texto com fonte de título
</div>

// Texto normal (usa Inter automaticamente)
<p className="text-muted-foreground">
  Descrição do componente
</p>
```

### **Hierarquia de Texto**
```tsx
<h1 className="text-3xl font-bold">        {/* 30px */}
<h2 className="text-2xl font-semibold">    {/* 24px */}
<h3 className="text-xl font-semibold">     {/* 20px */}
<p className="text-base">                  {/* 16px */}
<p className="text-sm text-muted-foreground"> {/* 14px */}
```

---

## 🎬 **COMPONENTES ANIMADOS**

### **AnimatedCard**
Card com fade-in + slide-up animation.

```tsx
import { AnimatedCard } from "@/components/ui/animated";

// Simples
<AnimatedCard>
  <CardContent>...</CardContent>
</AnimatedCard>

// Com delay (para stagger em listas)
<AnimatedCard delay={0.1}>
  <CardContent>...</CardContent>
</AnimatedCard>

// Lista com stagger
{items.map((item, index) => (
  <AnimatedCard key={item.id} delay={index * 0.06}>
    <CardContent>{item.name}</CardContent>
  </AnimatedCard>
))}
```

### **AnimatedButton**
Botão com hover elevado e tap scale.

```tsx

<AnimatedButton 
  onClick={handleClick}
  className="bg-secondary hover:bg-secondary/90"
>
  Criar Venloedor
</AnimatedButton>

### **TabsIndicator**
Indicador animado para Tabs (em desenvolvimento).
{{ ... }}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card className="border-l-4 border-l-primary">
    <CardContent className="pt-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Total de Venloas
        </p>
        <p className="text-4xl font-bold text-primary mt-2">
          {vendas.length}
        </p>
      </div>
{{ ... }}
    </CardContent>
  </Card>

  <Card className="border-l-4 border-l-secondary">
    <CardContent className="pt-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Valor Total
        </p>
        <p className="text-4xl font-bold text-secondary mt-2">
          {formatCurrency(total)}
        </p>
      </div>
    </CardContent>
  </Card>

  <Card className="border-l-4 border-l-accent">
    <CardContent className="pt-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Ticket Médio
        </p>
        <p className="text-4xl font-bold text-accent mt-2">
          {formatCurrency(media)}
        </p>
      </div>
    </CardContent>
  </Card>
</div>
```

### **Empty State**
```tsx
<Card>
  <CardContent className="py-16">
    <div className="text-center">
      <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
      <p className="text-lg font-medium text-muted-foreground mb-2">
        Nenhum item encontrado
      </p>
      <p className="text-sm text-muted-foreground">
        Adicione o primeiro item para começar
      </p>
      <Button className="mt-4 bg-secondary hover:bg-secondary/90">
        Adicionar Item
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## ♿ **ACESSIBILIDADE**

### **Botões com Ícones**
Sempre adicione `aria-label`:
```tsx
<Button
  variant="outline"
  size="icon"
  onClick={handleBack}
  aria-label="Voltar"
>
  <ArrowLeft className="h-4 w-4" />
</Button>
```

### **Focus Visível**
Todos os botões e links têm focus visível automático via Tailwind:
```tsx
// Focus é automático, mas você pode customizar:
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Clique aqui
</Button>
```

### **Respeitando prefers-reduced-motion**
Animações são automaticamente reduzidas se o usuário tiver essa preferência:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📱 **RESPONSIVIDADE**

### **Breakpoints Tailwind**
```
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (laptop)
xl: 1280px  (desktop)
2xl: 1536px (large desktop)
```

### **Exemplo de Grid Responsivo**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 coluna em mobile, 2 em tablet, 3 em desktop */}
</div>
```

### **Espaçamento Responsivo**
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding aumenta com o tamanho da tela */}
</div>
```

---

## 🌙 **DARK MODE**

O sistema está preparado para dark mode. Para ativar:

```tsx
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Alternar Tema
    </Button>
  );
}
```

Cores se adaptam automaticamente via CSS vars.

---

## 🛠️ **UTILITÁRIOS**

### **Classes Personalizadas**
```css
.vendr-btn-primary      /* Botão azul primário */
.vendr-btn-secondary    /* Botão laranja CTA */
.vendr-card             /* Card com sombra padrão */
.vendr-card-gradient    /* Card com gradiente */
.badge-active           /* Badge verde */
.badge-inactive         /* Badge vermelho */
.badge-pending          /* Badge amarelo */
```

### **Animações CSS**
```css
.animate-fade-in        /* Fade in 0.3s */
.animate-slide-up       /* Slide up 0.4s */
.animate-scale          /* Scale 0.2s */
```

---

## 📝 **CHECKLIST DE QUALIDADE**

Ao criar um novo componente ou página:

- [ ] Usa cores do design system (primary, secondary, accent)
- [ ] Fontes corretas (Outfit para títulos, Inter para texto)
- [ ] Botões têm hover e estados visuais claros
- [ ] Cards têm sombra (`shadow-md` ou `shadow-lg`)
- [ ] Header com botões Voltar/Início (páginas internas)
- [ ] Empty states têm ícone + texto + CTA
- [ ] Badges coloridos por status
- [ ] Animações suaves (AnimatedCard em listas)
- [ ] `aria-label` em botões com ícone
- [ ] Focus visível em elementos interativos
- [ ] Responsivo (grid, padding, texto)
- [ ] Teste em mobile e desktop

---

## 🚀 **EXEMPLOS COMPLETOS**

Confira as páginas implementadas:
- `/empresa/transferencias` - Header + AnimatedButton + Cards coloridos
- `/relatorios` - Tabs + Filtros + Empty states + Export
- `/dashboard` - (próximo a ser atualizado)
- `/vendedores` - (próximo a ser atualizado)

---

## 📚 **RECURSOS**

- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/docs
- **Framer Motion:** https://www.framer.com/motion/
- **Lucide Icons:** https://lucide.dev/icons

---

**Made with ❤️ for VENDR**
