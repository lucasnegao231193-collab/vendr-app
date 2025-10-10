/**
 * AppShell Component - MODERNIZADO
 * Shell principal com Trust Blue Design System
 * ModernTopBar + ModernSidebar
 */
"use client";

import { ModernTopBar } from "../ModernTopBar";
import { ModernSidebar } from "../ModernSidebar";
import { BottomNav } from "./BottomNav";
import { UserRole } from "@/lib/navigation";

interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
}

export function AppShell({ children, role, userName }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-trust-blue-900">
      {/* Sidebar - Desktop only */}
      <div className="hidden lg:block">
        <ModernSidebar userRole={role} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar Fixo */}
        <ModernTopBar userName={userName} notifications={0} />

        {/* Área de Conteúdo com Scroll */}
        <main className="flex-1 overflow-y-auto pt-16 pb-20 lg:pb-0">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* BottomNav - Mobile only */}
      <div className="lg:hidden">
        <BottomNav role={role} />
      </div>
    </div>
  );
}
