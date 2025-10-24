/**
 * VendedorLayout - Layout completo para área do vendedor
 * Inclui TopBar + Sidebar + BottomNav
 */
"use client";

import { ModernTopBar } from "./ModernTopBar";
import { VendedorSidebar } from "./VendedorSidebar";
import { BottomNav } from "./layout/BottomNav";

interface VendedorLayoutProps {
  children: React.ReactNode;
}

export function VendedorLayout({ children }: VendedorLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <ModernTopBar userRole="seller" userName="Vendedor" logoSrc="/vendr-white-v3.png" />
      <div className="flex pt-16">
        <VendedorSidebar />
        <main className="flex-1 w-full lg:ml-64 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomNav role="seller" />
    </div>
  );
}
