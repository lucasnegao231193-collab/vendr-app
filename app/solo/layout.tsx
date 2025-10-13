/**
 * Layout do Dashboard Solo
 * Com sidebar específico para autônomos
 */
import { SoloSidebar } from "@/components/SoloSidebar";

export default function SoloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <SoloSidebar />
      <main className="ml-[280px] transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
