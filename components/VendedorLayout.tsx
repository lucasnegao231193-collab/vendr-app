/**
 * VendedorLayout - Layout completo para área do vendedor
 * Inclui TopBar + Sidebar
 */
"use client";

import { UnifiedTopBar } from "./UnifiedTopBar";
import { VendedorSidebar } from "./VendedorSidebar";

interface VendedorLayoutProps {
  children: React.ReactNode;
}

export function VendedorLayout({ children }: VendedorLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedTopBar userRole="seller" />
      <div className="flex pt-16">
        <VendedorSidebar />
        <main className="flex-1 w-full lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
