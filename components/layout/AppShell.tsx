/**
 * AppShell Component
 * Shell principal do app com GlobalTopBar (azul #0057FF), SideNav, BottomNav e conteúdo
 */
"use client";

import { GlobalTopBar } from "../GlobalTopBar";
import { SideNav } from "./SideNav";
import { BottomNav } from "./BottomNav";
import { Breadcrumbs } from "./Breadcrumbs";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { UserRole } from "@/lib/navigation";

interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
}

export function AppShell({ children, role, userName }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      {/* TopBar fixo azul */}
      <GlobalTopBar role={role} userName={userName} />

      <div className="flex">
        {/* SideNav (desktop only) */}
        <SideNav role={role} />

        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>

      {/* BottomNav (mobile only) */}
      <BottomNav role={role} />

      {/* Floating WhatsApp */}
      <FloatingWhatsApp role={role} />
    </div>
  );
}
