/**
 * TopBar Moderna com Navegação
 * Barra azul fixa com logo e botões de navegação
 */
"use client";

import { ArrowLeft, Home, MessageCircle, Moon, Sun } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";

interface ModernTopBarProps {
  userName?: string;
}

export function ModernTopBar({ userName = "Usuário" }: ModernTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    // Redirecionar baseado na rota atual
    if (pathname.startsWith("/vendedor")) {
      router.push("/vendedor");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSupport = () => {
    const phone = "+5513981401945";
    const message = "Olá, estou com dúvida no painel Vendr.";
    const url = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.header
      className="vendr-topbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* Logo à esquerda */}
        <div className="flex items-center gap-4">
          <Image
            src="/logo-vendr.png"
            alt="Vendr"
            width={100}
            height={30}
            className="h-8 w-auto"
          />
        </div>

        {/* Botões à direita */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="text-white hover:bg-white/20"
          >
            <Home className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSupport}
            className="text-white hover:bg-white/20"
          >
            <MessageCircle className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Suporte</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-white hover:bg-white/20"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
