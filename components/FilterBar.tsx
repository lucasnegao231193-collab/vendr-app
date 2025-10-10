/**
 * FilterBar - Sistema de Filtros Avançados
 * Venlo Design System
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  onSearch?: (value: string) => void;
  onFilterChange?: (filters: any) => void;
  placeholder?: string;
  showDateFilter?: boolean;
  className?: string;
}

export function FilterBar({
  onSearch,
  onFilterChange,
  placeholder = "Buscar...",
  showDateFilter = true,
  className,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const clearFilters = () => {
    setSearchValue("");
    setActiveFilters(0);
    onSearch?.("");
    onFilterChange?.({});
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barra Principal */}
      <div className="flex items-center gap-3">
        {/* Input de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-10 bg-white dark:bg-trust-blue-800 border-gray-300 dark:border-trust-blue-700"
          />
          {searchValue && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Botão Filtros */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "gap-2",
            activeFilters > 0 && "border-venlo-orange-500 text-venlo-orange-500"
          )}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilters > 0 && (
            <span className="bg-venlo-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </Button>

        {/* Botão Limpar */}
        {(activeFilters > 0 || searchValue) && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Painel de Filtros Expansível */}
      <motion.div
        initial={false}
        animate={{
          height: showFilters ? "auto" : 0,
          opacity: showFilters ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="bg-white dark:bg-trust-blue-800 rounded-venlo-lg border border-gray-200 dark:border-trust-blue-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Data */}
            {showDateFilter && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Período
                </label>
                <div className="flex gap-2">
                  <Input type="date" className="flex-1" />
                  <span className="text-gray-500 self-center">até</span>
                  <Input type="date" className="flex-1" />
                </div>
              </div>
            )}

            {/* Filtro de Status (exemplo) */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Status
              </label>
              <select className="w-full h-10 px-3 rounded-venlo border border-gray-300 dark:border-trust-blue-700 bg-white dark:bg-trust-blue-900 text-gray-900 dark:text-white">
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            {/* Filtro Customizado */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Categoria
              </label>
              <select className="w-full h-10 px-3 rounded-venlo border border-gray-300 dark:border-trust-blue-700 bg-white dark:bg-trust-blue-900 text-gray-900 dark:text-white">
                <option value="">Todas</option>
                <option value="cat1">Categoria 1</option>
                <option value="cat2">Categoria 2</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setActiveFilters(2); // Atualizar contador
                setShowFilters(false);
              }}
              className="bg-venlo-orange-500 hover:bg-venlo-orange-600 text-white"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
