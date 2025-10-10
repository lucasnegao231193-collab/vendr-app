/**
 * AnimatedButton - Botão com microinterações
 */
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ComponentPropsWithoutRef } from "react";

type AnimatedButtonProps = ComponentPropsWithoutRef<typeof Button>;

export function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}
