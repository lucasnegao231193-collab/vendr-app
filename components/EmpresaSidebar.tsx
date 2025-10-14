/**
 * EmpresaSidebar - Sidebar lateral para área da empresa
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  FileText,
  Settings,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Produtos",
    href: "/produtos",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Vendas",
    href: "/vendas",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: "Vendedores",
    href: "/vendedores",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Transferências",
    href: "/transferencias",
    icon: <Send className="h-5 w-5" />,
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function EmpresaSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-[#0f172a] text-white transition-all duration-300 fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 border-r border-white/10",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Menu Title */}
        {!collapsed && (
          <div className="px-6 py-4 text-sm text-white/60 font-medium border-b border-white/10">
            Menu Empresa
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-4 border-t border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </aside>

      {/* Spacer para não sobrepor o conteúdo */}
      <div className={cn("hidden lg:block transition-all duration-300", collapsed ? "w-20" : "w-64")} />
    </>
  );
}
