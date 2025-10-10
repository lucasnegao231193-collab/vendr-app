/**
 * AnimatedCard - Card com animação fade-in + slide-up
 */
"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { forwardRef, ComponentPropsWithoutRef } from "react";

interface AnimatedCardProps extends ComponentPropsWithoutRef<typeof Card> {
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ delay = 0, children, ...props }, ref) => {
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
        <Card ref={ref} {...props}>{children}</Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
