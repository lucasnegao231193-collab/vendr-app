/**
 * BottomNav Component
 * Navegação inferior para mobile (<1024px)
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Wallet,
  Plus,
  ArrowLeftRight,
  MapPin,
  Menu,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/navigation";

interface BottomNavProps {
  role: UserRole;
  onMenuClick: () => void;
}

export function BottomNav({ role, onMenuClick }: BottomNavProps) {
  const pathname = usePathname();

  const ownerItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Vendas", href: "/vendas", icon: ShoppingCart },
    { label: "Estoque", href: "/estoque", icon: Package },
    { label: "Menu", onClick: onMenuClick, icon: Menu },
  ];

  const sellerItems = [
    { label: "Home", href: "/vendedor", icon: LayoutDashboard },
    { label: "Estoque", href: "/vendedor/estoque", icon: Package },
    { label: "Fechar", href: "/vendedor/fechar", icon: Wallet },
    { label: "Menu", onClick: onMenuClick, icon: Menu },
  ];

  const soloItems = [
    { label: "Home", href: "/solo", icon: LayoutDashboard },
    { label: "Vendas", href: "/solo/vendas", icon: ShoppingCart },
    { label: "Estoque", href: "/solo/estoque", icon: Package },
    { label: "Menu", onClick: onMenuClick, icon: Menu },
  ];

  const items = role === 'owner' ? ownerItems : role === 'seller' ? sellerItems : soloItems;

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
        <div className="grid h-16 grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            
            // Se tem onClick, é um botão (Menu)
            if ('onClick' in item && item.onClick) {
              return (
                <button
                  key={`button-${index}`}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center gap-1 transition-colors text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            }
            
            // Senão, é um link
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href!}
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
