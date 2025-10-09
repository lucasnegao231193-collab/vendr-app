/**
 * BottomNav Component
 * Navegação inferior para mobile (<1024px)
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Wallet,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/navigation";

interface BottomNavProps {
  role: UserRole;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const ownerItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Vendedores", href: "/vendedores", icon: Users },
    { label: "Estoque", href: "/estoque", icon: Package },
    { label: "Financeiro", href: "/financeiro", icon: Wallet },
    { label: "Mais", href: "/configuracoes", icon: MoreHorizontal },
  ];

  const sellerItems = [
    { label: "Home", href: "/vendedor", icon: LayoutDashboard },
    { label: "Vendas", href: "/vendedor/venda", icon: Package },
    { label: "Fechar", href: "/vendedor/fechar", icon: Wallet },
    { label: "Mais", href: "/configuracoes", icon: MoreHorizontal },
  ];

  const items = role === 'owner' ? ownerItems : sellerItems;

  return (
    <>
      {/* FAB (Floating Action Button) para vendedores */}
      {role === 'seller' && (
        <Link
          href="/vendedor/venda"
          className="lg:hidden fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2"
          aria-label="Nova Venda"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}

      {/* Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-soft)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  isActive
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--text-secondary)]"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
