/**
 * VendedorLayout - Layout completo para área do vendedor
 * Inclui TopBar + Sidebar + BottomNav + DrawerMenu
 */
"use client";

import { useState } from "react";
import { ModernTopBar } from "./ModernTopBar";
import { VendedorSidebar } from "./VendedorSidebar";
import { BottomNav } from "./layout/BottomNav";
import { DrawerMenu } from "./layout/DrawerMenu";

interface VendedorLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function VendedorLayout({ children, userName, userEmail }: VendedorLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <ModernTopBar 
        userRole="seller" 
        userName={userName || "Vendedor"} 
        logoSrc="/vendr-white-v3.png" 
      />
      <div className="flex pt-16">
        <VendedorSidebar />
        <main className="flex-1 w-full lg:ml-64 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      
      {/* DrawerMenu - Mobile only */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        role="seller"
        userName={userName}
        userEmail={userEmail}
      />
      
      {/* BottomNav - Mobile only */}
      <BottomNav 
        role="seller" 
        onMenuClick={() => setIsDrawerOpen(true)}
      />
    </div>
  );
}
