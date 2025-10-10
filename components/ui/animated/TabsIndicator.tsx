/**
 * TabsIndicator - Indicador animado para Tabs
 */
"use client";

import { motion } from "framer-motion";

interface TabsIndicatorProps {
  activeIndex: number;
  tabs: number;
}

export function TabsIndicator({ activeIndex, tabs }: TabsIndicatorProps) {
  const width = `${100 / tabs}%`;
  const left = `${(activeIndex * 100) / tabs}%`;

  return (
    <motion.div
      className="absolute bottom-0 h-0.5 bg-primary"
      style={{ width }}
      initial={false}
      animate={{ left }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    />
  );
}
