/**
 * GlobalSearch - Busca global com Cmd+K
 * Busca páginas, ações e navegação rápida
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, Package, DollarSign, Settings, TrendingUp, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  path: string;
  icon: React.ReactNode;
  keywords: string[];
}

const searchItems: SearchItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Visão geral e métricas",
    path: "/dashboard",
    icon: <TrendingUp className="h-4 w-4" />,
    keywords: ["dashboard", "inicio", "home", "métricas", "kpis"],
  },
  {
    id: "vendedores",
    title: "Vendedores",
    description: "Gerenciar vendedores",
    path: "/vendedores",
    icon: <Users className="h-4 w-4" />,
    keywords: ["vendedores", "vendedor", "equipe", "time", "sellers"],
  },
  {
    id: "estoque",
    title: "Estoque",
    description: "Inventário e produtos",
    path: "/estoque",
    icon: <Package className="h-4 w-4" />,
    keywords: ["estoque", "produtos", "inventario", "stock"],
  },
  {
    id: "transferencias",
    title: "Transferências",
    description: "Transferir produtos aos vendedores",
    path: "/operacoes",
    icon: <ArrowRight className="h-4 w-4" />,
    keywords: ["transferencia", "transferir", "enviar", "operacoes"],
  },
  {
    id: "financeiro",
    title: "Financeiro",
    description: "Vendas e relatórios",
    path: "/financeiro",
    icon: <DollarSign className="h-4 w-4" />,
    keywords: ["financeiro", "vendas", "dinheiro", "receita", "faturamento"],
  },
  {
    id: "relatorios",
    title: "Relatórios",
    description: "Análises e gráficos",
    path: "/relatorios",
    icon: <FileText className="h-4 w-4" />,
    keywords: ["relatorios", "reports", "graficos", "analise"],
  },
  {
    id: "configuracoes",
    title: "Configurações",
    description: "Ajustes e preferências",
    path: "/configuracoes",
    icon: <Settings className="h-4 w-4" />,
    keywords: ["configuracoes", "settings", "ajustes", "preferencias"],
  },
  {
    id: "produtos",
    title: "Produtos",
    description: "Cadastro de produtos",
    path: "/produtos",
    icon: <Package className="h-4 w-4" />,
    keywords: ["produtos", "cadastro", "items"],
  },
];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>(searchItems);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Filtrar items baseado na busca
  useEffect(() => {
    if (!query.trim()) {
      setFilteredItems(searchItems);
      setSelectedIndex(0);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = searchItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((keyword) => keyword.includes(lowerQuery))
      );
    });

    setFilteredItems(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Navegação por teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleNavigate(filteredItems[selectedIndex].path);
        }
      }
    },
    [filteredItems, selectedIndex]
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar páginas, ações..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 px-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhum resultado encontrado</p>
              <p className="text-xs mt-1">
                Tente buscar por: vendedores, estoque, financeiro...
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                    selectedIndex === index
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      selectedIndex === index
                        ? "bg-primary/20 text-primary"
                        : "bg-muted"
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {selectedIndex === index && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <kbd className="px-1.5 py-0.5 bg-background border rounded">
                        ↵
                      </kbd>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background border rounded">↓</kbd>
              <span className="ml-1">Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded">↵</kbd>
              <span className="ml-1">Abrir</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded">ESC</kbd>
            <span className="ml-1">Fechar</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
