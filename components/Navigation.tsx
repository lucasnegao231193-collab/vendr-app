/**
 * Componente de navegação para owner
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  FileText,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/vendedores", label: "Vendedores", icon: Users },
  { href: "/operacoes", label: "Operações", icon: ClipboardList },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-primary">Ven</span>
              <span className="text-secondary">dr</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={isActive ? "vendr-btn-primary" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <Button variant="ghost" onClick={handleLogout} size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 min-w-0 px-3 py-3 text-center text-xs ${
                  isActive ? "text-primary border-b-2 border-primary" : "text-gray-600"
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <span className="block truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
