/**
 * Sidebar para Dashboard Solo (Autônomo)
 * Menu simplificado sem "Vendedores" e "Transferências"
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  ShoppingCart,
  Crown,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const soloNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/solo",
    icon: LayoutDashboard,
  },
  {
    label: "Estoque",
    href: "/solo/estoque",
    icon: Package,
  },
  {
    label: "Vendas",
    href: "/solo/vendas",
    icon: ShoppingCart,
  },
  {
    label: "Financeiro",
    href: "/solo/financeiro",
    icon: DollarSign,
  },
  {
    label: "Assinatura",
    href: "/solo/assinatura",
    icon: Crown,
  },
  {
    label: "Configurações",
    href: "/solo/configuracoes",
    icon: Settings,
  },
];

export function SoloSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0, width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-30",
        "bg-trust-blue-900 dark:bg-trust-blue-800",
        "border-r border-trust-blue-800 dark:border-trust-blue-700",
        "flex flex-col"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-trust-blue-800">
        {!collapsed && (
          <Link href="/solo" className="flex items-center gap-2">
            <Image
              src="/vendr-white-v3.png"
              alt="Vendr"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-trust-blue-800 ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {soloNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                isActive
                  ? "bg-venlo-orange-500 text-white"
                  : "text-gray-300 hover:bg-trust-blue-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Plan Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-trust-blue-800">
          <div className="bg-trust-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-venlo-orange-500" />
              <span className="text-xs font-semibold text-white">Plano Solo Free</span>
            </div>
            <p className="text-xs text-gray-400">30 vendas/mês</p>
            <Link
              href="/solo/assinatura"
              className="text-xs text-venlo-orange-500 hover:underline mt-2 block"
            >
              Ver planos
            </Link>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
