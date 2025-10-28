/**
 * Layout do Dashboard Solo
 * Com sidebar e topbar para autônomos
 */
"use client";

import { useState } from "react";
import { SoloSidebar } from "@/components/SoloSidebar";
import { ModernTopBar } from "@/components/ModernTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { DrawerMenu } from "@/components/layout/DrawerMenu";

export default function SoloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <ModernTopBar userName="Autônomo" logoSrc="/vendr-white-v3.png" userRole="solo" />
      <SoloSidebar />
      <main className="md:ml-[280px] pt-16 pb-20 md:pb-6 transition-all duration-300">
        {children}
      </main>
      
      {/* DrawerMenu - Mobile only */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        role="solo"
        userName="Autônomo"
      />
      
      {/* BottomNav - Mobile only */}
      <BottomNav 
        role="solo" 
        onMenuClick={() => setIsDrawerOpen(true)}
      />
    </div>
  );
}
