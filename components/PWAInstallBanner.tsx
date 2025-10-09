/**
 * Banner para instalar PWA
 */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <div className="bg-white border-2 border-primary rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Instalar Vendr</h3>
            <p className="text-sm text-muted-foreground">
              Instale o app para acesso rápido e uso offline
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBanner(false)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={handleInstall} className="flex-1 vendr-btn-primary">
            Instalar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBanner(false)}
            className="flex-1"
          >
            Agora não
          </Button>
        </div>
      </div>
    </div>
  );
}
