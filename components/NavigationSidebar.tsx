/**
 * NavigationSidebar - Menu lateral consistente com item Transferências
 */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowLeftRight,
  BarChart3,
  DollarSign,
  Settings,
  TrendingUp
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: "owner" | "seller" | "both";
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    role: "both",
  },
  {
    label: "Vendedores",
    href: "/vendedores",
    icon: Users,
    role: "owner",
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: Package,
    role: "owner",
  },
  {
    label: "Transferências",
    href: "/empresa/transferencias",
    icon: ArrowLeftRight,
    role: "owner",
  },
  {
    label: "Operações",
    href: "/operacoes",
    icon: TrendingUp,
    role: "owner",
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    role: "both",
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    role: "both",
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    role: "both",
  },
];

interface NavigationSidebarProps {
  role?: "owner" | "seller";
}

export function NavigationSidebar({ role = "owner" }: NavigationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const filteredItems = navItems.filter(
    (item) => !item.role || item.role === "both" || item.role === role
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
      <nav className="p-4 space-y-1">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left",
                active
                  ? "bg-[#0A66FF]/10 text-[#0A66FF]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {active && (
                <div className="absolute left-0 w-1 h-8 bg-[#0A66FF] rounded-r-full" />
              )}
              <Icon className={cn("h-5 w-5", active && "text-[#0A66FF]")} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
