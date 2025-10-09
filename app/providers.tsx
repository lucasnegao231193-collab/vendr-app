/**
 * Providers globais do app
 */
"use client";

import { useEffect } from "react";
import { useOfflineQueue } from "@/store/offlineQueue";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  const { init } = useOfflineQueue();

  useEffect(() => {
    // Inicializar fila offline
    init();
  }, [init]);

  return (
    <>
      {children}
      <PWAInstallBanner />
    </>
  );
}
