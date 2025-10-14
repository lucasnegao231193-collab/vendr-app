/**
 * EmpresaLayout - Layout completo para área da empresa
 * Inclui TopBar + Sidebar
 */
"use client";

import { UnifiedTopBar } from "./UnifiedTopBar";
import { EmpresaSidebar } from "./EmpresaSidebar";

interface EmpresaLayoutProps {
  children: React.ReactNode;
}

export function EmpresaLayout({ children }: EmpresaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedTopBar userRole="owner" />
      <div className="flex pt-16">
        <EmpresaSidebar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
