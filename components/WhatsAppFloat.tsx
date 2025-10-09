/**
 * Botão Flutuante de WhatsApp
 * Abre conversa direta com o suporte
 */
"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppFloat() {
  const phoneNumber = "+5513981401945";
  const message = "Olá, estou com dúvida no painel Vendr.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.button
      onClick={handleClick}
      className="whatsapp-float"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      aria-label="Abrir WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </motion.button>
  );
}
