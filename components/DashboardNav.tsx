/**
 * Navegação em abas secundárias do Dashboard
 * Vendedores | Estoque | Financeiro
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Package, DollarSign } from "lucide-react";

const tabs = [
  {
    name: "Vendedores",
    href: "/vendedores",
    icon: Users,
  },
  {
    name: "Estoque",
    href: "/estoque",
    icon: Package,
  },
  {
    name: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="flex gap-1 px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-[#0057FF] text-[#0057FF] bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
