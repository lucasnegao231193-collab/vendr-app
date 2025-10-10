/**
 * TopBar Moderna Trust Blue - Venlo Design System
 * Altura 64px, busca global, notificações, user menu
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/providers/ThemeProvider";
import { GlobalSearch } from "@/components/GlobalSearch";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ModernTopBarProps {
  userName?: string;
  userAvatar?: string;
  notifications?: number;
}

export function ModernTopBar({
  userName = "Usuário",
  userAvatar,
  notifications = 0,
}: ModernTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Cmd+K / Ctrl+K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    router.push("/login");
  };

  const mockNotifications = [
    { id: 1, text: "Transferência aceita por João Silva", time: "5 min atrás" },
    { id: 2, text: "Nova venda registrada", time: "15 min atrás" },
    { id: 3, text: "Meta diária atingida!", time: "1h atrás" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-trust-blue-900 dark:bg-trust-blue-700 border-b border-trust-blue-800 dark:border-trust-blue-600 fixed top-0 left-0 right-0 z-40"
    >
      <div className="h-full flex items-center justify-between px-6 gap-4">
        {/* Logo */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="h-10 w-10 bg-venlo-orange-500 rounded-venlo flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-white font-bold text-xl hidden sm:inline">
            Vendr
          </span>
        </button>

        {/* Busca Global */}
        <div className="flex-1 max-w-xl hidden md:block">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full relative group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <div className="w-full pl-10 pr-20 py-2 rounded-lg bg-trust-blue-800 dark:bg-trust-blue-600 border border-trust-blue-700 dark:border-trust-blue-500 text-left text-gray-400 text-sm group-hover:border-venlo-orange-500 transition-colors">
              Buscar...
            </div>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-trust-blue-700 dark:bg-trust-blue-500 rounded text-xs text-gray-300 border border-trust-blue-600">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Dialog de Busca */}
        <GlobalSearch open={showSearch} onOpenChange={setShowSearch} />

        {/* Ações Direita */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-white hover:bg-trust-blue-800 dark:hover:bg-trust-blue-600"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notificações */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-white hover:bg-trust-blue-800 dark:hover:bg-trust-blue-600"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-venlo-orange-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </Button>

            {/* Dropdown Notificações */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-trust-blue-800 rounded-venlo-lg shadow-2xl border border-gray-200 dark:border-trust-blue-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-trust-blue-700">
                    <h3 className="font-semibold text-trust-blue-900 dark:text-white">
                      Notificações
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-trust-blue-700 border-b border-gray-100 dark:border-trust-blue-700 cursor-pointer"
                      >
                        <p className="text-sm text-trust-blue-900 dark:text-white">
                          {notif.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-200 dark:border-trust-blue-700">
                    <button className="text-sm text-venlo-orange-500 hover:text-venlo-orange-600 font-medium">
                      Ver todas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-venlo hover:bg-trust-blue-800 dark:hover:bg-trust-blue-600 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-venlo-orange-500 flex items-center justify-center text-white font-medium text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-sm hidden lg:inline">
                {userName}
              </span>
              <ChevronDown className="h-4 w-4 text-white" />
            </button>

            {/* Dropdown User Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-trust-blue-800 rounded-venlo-lg shadow-2xl border border-gray-200 dark:border-trust-blue-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-trust-blue-700">
                    <p className="font-semibold text-trust-blue-900 dark:text-white">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      owner@venlo.com
                    </p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => router.push("/configuracoes")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-trust-blue-700"
                    >
                      <User className="h-4 w-4" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => router.push("/configuracoes")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-trust-blue-700"
                    >
                      <Settings className="h-4 w-4" />
                      Configurações
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-trust-blue-700 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-gray-100 dark:hover:bg-trust-blue-700"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
