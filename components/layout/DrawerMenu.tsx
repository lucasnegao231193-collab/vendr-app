/**
 * DrawerMenu Component
 * Menu lateral deslizante para mobile
 * Suporta ambos os painéis: Empresa (owner) e Pessoal (solo)
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  LayoutDashboard,
  ShoppingCart,
  Package,
  MapPin,
  BarChart3,
  Users,
  Settings,
  User,
  LogOut,
  Wallet,
  FileText,
  TrendingUp,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  role: "owner" | "seller" | "solo";
  userName?: string;
  userEmail?: string;
}

export function DrawerMenu({
  isOpen,
  onClose,
  role,
  userName,
  userEmail,
}: DrawerMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Fechar drawer ao clicar fora
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Menu items para Owner (Empresa)
  const ownerMenuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Visão geral",
    },
    {
      label: "Vendas",
      href: "/vendas",
      icon: ShoppingCart,
      description: "Gerenciar vendas",
    },
    {
      label: "Estoque",
      href: "/estoque",
      icon: Package,
      description: "Produtos e estoque",
    },
    {
      label: "Catálogo",
      href: "/catalogo",
      icon: MapPin,
      description: "Catálogo de produtos",
    },
    {
      label: "Relatórios",
      href: "/relatorios",
      icon: BarChart3,
      description: "Análises e relatórios",
    },
    {
      label: "Vendedores",
      href: "/vendedores",
      icon: Users,
      description: "Equipe de vendas",
    },
    {
      label: "Financeiro",
      href: "/financeiro",
      icon: Wallet,
      description: "Gestão financeira",
    },
  ];

  // Menu items para Solo (Pessoal)
  const soloMenuItems = [
    {
      label: "Dashboard",
      href: "/solo",
      icon: LayoutDashboard,
      description: "Visão geral",
    },
    {
      label: "Nova Venda",
      href: "/solo/venda",
      icon: ShoppingCart,
      description: "Registrar venda",
    },
    {
      label: "Vendas",
      href: "/solo/vendas",
      icon: FileText,
      description: "Histórico de vendas",
    },
    {
      label: "Estoque",
      href: "/solo/estoque",
      icon: Package,
      description: "Meus produtos",
    },
    {
      label: "Catálogo",
      href: "/catalogo",
      icon: MapPin,
      description: "Catálogo de produtos",
    },
    {
      label: "Relatórios",
      href: "/solo/relatorios",
      icon: TrendingUp,
      description: "Minhas estatísticas",
    },
    {
      label: "Meu Negócio",
      href: "/solo/empresa",
      icon: Store,
      description: "Dados do negócio",
    },
  ];

  // Menu items para Seller (Vendedor)
  const sellerMenuItems = [
    {
      label: "Dashboard",
      href: "/vendedor",
      icon: LayoutDashboard,
      description: "Meu painel",
    },
    {
      label: "Nova Venda",
      href: "/vendedor/venda",
      icon: ShoppingCart,
      description: "Registrar venda",
    },
    {
      label: "Estoque",
      href: "/vendedor/estoque",
      icon: Package,
      description: "Produtos disponíveis",
    },
    {
      label: "Fechar Dia",
      href: "/vendedor/fechar",
      icon: Wallet,
      description: "Fechamento de caixa",
    },
  ];

  const menuItems =
    role === "owner"
      ? ownerMenuItems
      : role === "solo"
      ? soloMenuItems
      : sellerMenuItems;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {userName || "Usuário"}
              </h3>
              <p className="text-xs text-gray-500">
                {role === "owner"
                  ? "Administrador"
                  : role === "solo"
                  ? "Conta Pessoal"
                  : "Vendedor"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto h-[calc(100%-180px)] py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-orange-50 text-orange-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white space-y-2">
          <Link
            href={role === "solo" ? "/solo/configuracoes" : "/configuracoes"}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Configurações</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
