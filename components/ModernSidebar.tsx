/**
 * Sidebar Moderna - Venlo Design System
 * Navegação vertical colapsável com Trust Blue
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Package,
  GitBranch,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingCart,
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  role?: string[]; // roles permitidos
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    role: ["owner", "admin"],
  },
  {
    label: "Vendedores",
    href: "/vendedores",
    icon: Users,
    role: ["owner", "admin"],
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: Package,
    role: ["owner", "admin"],
  },
  {
    label: "Operações",
    href: "/operacoes",
    icon: GitBranch,
    role: ["owner", "admin"],
  },
  {
    label: "Transferências",
    href: "/empresa/transferencias",
    icon: ArrowLeftRight,
    role: ["owner", "admin"],
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    role: ["owner", "admin"],
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    role: ["owner", "admin"],
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    role: ["owner", "admin"],
  },
];

// Navegação para Vendedor
const vendedorNavItems: NavItem[] = [
  {
    label: "Meu Dashboard",
    href: "/vendedor/dashboard",
    icon: Home,
  },
  {
    label: "Meu Estoque",
    href: "/vendedor/estoque",
    icon: Package,
  },
  {
    label: "Vendas",
    href: "/vendedor/venda",
    icon: ShoppingCart,
  },
  {
    label: "Transferências",
    href: "/vendedor/transferencias-recebidas",
    icon: ArrowLeftRight,
  },
  {
    label: "Minhas Metas",
    href: "/vendedor/metas",
    icon: TrendingUp,
  },
];

interface ModernSidebarProps {
  userRole?: string;
  className?: string;
}

export function ModernSidebar({ userRole = "owner", className }: ModernSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const items = userRole === "seller" ? vendedorNavItems : navItems;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "relative h-screen bg-white dark:bg-trust-blue-800",
        "border-r border-gray-200 dark:border-trust-blue-700",
        "flex flex-col",
        className
      )}
    >
      {/* Header com Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-trust-blue-700">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Image
                src="/logo-white.png"
                alt="Vendr"
                width={100}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-venlo",
                    "transition-all duration-200",
                    "group relative",
                    active
                      ? "bg-venlo-orange-100 dark:bg-venlo-orange-900/20 text-venlo-orange-600 dark:text-venlo-orange-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-trust-blue-700"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active
                        ? "text-venlo-orange-600 dark:text-venlo-orange-500"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )}
                  />

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge && !isCollapsed && (
                    <span className="ml-auto bg-venlo-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip para collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-trust-blue-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-trust-blue-700">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 dark:text-gray-400 text-center"
            >
              Venlo SaaS v2.0
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
