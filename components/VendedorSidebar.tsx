/**
 * VendedorSidebar - Sidebar lateral para área do vendedor
 * Inspirado no design do painel Solo
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
  PackageSearch,
  Target,
  Calculator,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/vendedor",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Meu Estoque",
    href: "/vendedor/estoque",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Nova Venda",
    href: "/vendedor/venda",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: "Transferências",
    href: "/vendedor/transferencias-recebidas",
    icon: <PackageSearch className="h-5 w-5" />,
  },
  {
    label: "Minhas Metas",
    href: "/vendedor/metas",
    icon: <Target className="h-5 w-5" />,
  },
  {
    label: "Calculadora",
    href: "/vendedor/troco",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    label: "Fechar Dia",
    href: "/vendedor/fechar",
    icon: <CheckCircle className="h-5 w-5" />,
  },
];

export function VendedorSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-[#1a1d29] text-white transition-all duration-300 fixed left-0 top-0 h-screen z-40",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          {!collapsed ? (
            <Image
              src="/vendr-logo-v3.png"
              alt="Venlo"
              width={120}
              height={40}
              className="object-contain"
              priority
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-xl">
                V
              </div>
            </div>
          )}
        </div>

        {/* Menu Title */}
        {!collapsed && (
          <div className="px-6 py-4 text-sm text-white/60 font-medium">
            Menu Vendedor
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
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
