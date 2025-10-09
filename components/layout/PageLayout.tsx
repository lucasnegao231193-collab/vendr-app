/**
 * PageLayout - Layout padrão com TopBar + Sidebar
 */
"use client";

import { GlobalTopBar } from "@/components/GlobalTopBar";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  role?: "owner" | "seller";
  showSidebar?: boolean;
}

export function PageLayout({
  children,
  className,
  role = "owner",
  showSidebar = true,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <GlobalTopBar role={role} />
      
      <div className="flex">
        {showSidebar && <NavigationSidebar role={role} />}
        
        <main
          className={cn(
            "flex-1 pt-4 pb-8 px-4 md:px-6",
            showSidebar ? "ml-64" : "",
            className
          )}
          style={{ marginTop: "64px" }}
        >
          <div className="max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
