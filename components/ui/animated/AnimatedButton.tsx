/**
 * AnimatedButton - Botão com microinterações
 */
"use client";

import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

export const AnimatedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
