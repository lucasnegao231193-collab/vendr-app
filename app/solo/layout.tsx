/**
 * Layout do Dashboard Solo
 * Com sidebar e topbar para autônomos
 */
import { SoloSidebar } from "@/components/SoloSidebar";
import { ModernTopBar } from "@/components/ModernTopBar";

export default function SoloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <ModernTopBar userName="Autônomo" logoSrc="/vendr-white-v3.png" />
      <SoloSidebar />
      <main className="md:ml-[280px] pt-16 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
