/**
 * AnimatedCard - Card com animação fade-in + slide-up
 */
"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ComponentPropsWithoutRef } from "react";

interface AnimatedCardProps extends ComponentPropsWithoutRef<typeof Card> {
  delay?: number;
}

export function AnimatedCard({ delay = 0, children, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
}
