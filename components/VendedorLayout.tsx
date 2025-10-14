/**
 * VendedorLayout - Layout completo para área do vendedor
 * Inclui TopBar + Sidebar
 */
"use client";

import { GlobalTopBar } from "./GlobalTopBar";
import { VendedorSidebar } from "./VendedorSidebar";

interface VendedorLayoutProps {
  children: React.ReactNode;
}

export function VendedorLayout({ children }: VendedorLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <GlobalTopBar />
      <div className="flex">
        <VendedorSidebar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
