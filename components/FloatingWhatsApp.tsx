/**
 * Floating WhatsApp Support Button
 * Botão flutuante para suporte via WhatsApp
 */
"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { openWhatsApp, getContextualMessage } from "@/lib/whatsapp";
import { UserRole } from "@/lib/navigation";
import { useToast } from "@/components/ui/use-toast";

interface FloatingWhatsAppProps {
  role: UserRole;
}

export function FloatingWhatsApp({ role }: FloatingWhatsAppProps) {
  const pathname = usePathname();
  const { toast } = useToast();

  const handleClick = () => {
    const phone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '+5511999999999';
    const message = getContextualMessage(role, pathname);

    toast({
      title: "Abrindo WhatsApp...",
      description: "Você será redirecionado para conversar com nosso suporte.",
    });

    openWhatsApp(phone, message);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Suporte via WhatsApp"
      className="fixed bottom-6 right-6 lg:bottom-6 sm:bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
