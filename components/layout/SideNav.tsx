/**
 * SideNav Component
 * Navegação lateral para desktop (≥1024px)
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  LifeBuoy,
  ArrowLeftRight,
  PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/navigation";
import { openWhatsApp, getContextualMessage } from "@/lib/whatsapp";
import { useToast } from "@/components/ui/use-toast";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  action?: () => void;
}

interface SideNavProps {
  role: UserRole;
}

export function SideNav({ role }: SideNavProps) {
  const pathname = usePathname();
  const { toast } = useToast();

  const handleSupport = () => {
    const phone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '+5511999999999';
    const message = getContextualMessage(role, pathname);

    toast({
      title: "Abrindo WhatsApp...",
      description: "Redirecionando para suporte.",
    });

    openWhatsApp(phone, message);
  };

  const ownerItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Vendedores", href: "/vendedores", icon: Users },
    { label: "Estoque", href: "/estoque", icon: Package },
    { label: "Transferências", href: "/empresa/transferencias", icon: ArrowLeftRight },
    { label: "Devoluções", href: "/empresa/devolucoes", icon: PackageOpen },
    { label: "Operações", href: "/operacoes", icon: Receipt },
    { label: "Financeiro", href: "/financeiro", icon: Wallet },
    { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
    { label: "Configurações", href: "/configuracoes", icon: Settings },
    { label: "Suporte", icon: LifeBuoy, action: handleSupport },
  ];

  const sellerItems: NavItem[] = [
    { label: "Início", href: "/vendedor", icon: LayoutDashboard },
    { label: "Nova Venda", href: "/vendedor/venda", icon: Receipt },
    { label: "Meu Estoque", href: "/vendedor/estoque", icon: Package },
    { label: "Transferências", href: "/vendedor/transferencias-recebidas", icon: ArrowLeftRight },
    { label: "Fechar Dia", href: "/vendedor/fechar", icon: Wallet },
    { label: "Suporte", icon: LifeBuoy, action: handleSupport },
  ];

  const items = role === 'owner' ? ownerItems : sellerItems;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--border-soft)] bg-white">
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive = item.href && pathname === item.href;
          const Icon = item.icon;

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
