/**
 * Breadcrumbs Component
 * Navegação contextual para melhor UX
 */
"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  vendedores: "Vendedores",
  estoque: "Estoque",
  produtos: "Produtos",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  operacoes: "Operações",
  vendedor: "Vendedor",
  venda: "Nova Venda",
  troco: "Calculadora de Troco",
  fechar: "Fechar Dia",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-[#0057FF] transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const name = routeNames[segment] || segment;

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-[#0057FF]">{name}</span>
            ) : (
              <Link
                href={path}
                className="hover:text-[#0057FF] transition-colors"
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
