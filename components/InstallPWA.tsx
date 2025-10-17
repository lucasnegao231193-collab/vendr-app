"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Já está instalado
    }

    // Verificar se o usuário já dispensou o banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // Capturar o evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar banner após 10 segundos
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso');
    }

    // Limpar o prompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-2 border-[#415A77] shadow-2xl bg-white">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#415A77] to-[#1B263B] rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-[#0D1B2A] mb-1">
                Instalar Venlo
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Instale o app na sua tela inicial para acesso rápido e funcionalidade offline.
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="bg-[#FF6600] hover:bg-[#cc5200] text-white"
                  size="sm"
                >
                  Instalar
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                >
                  Agora não
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
