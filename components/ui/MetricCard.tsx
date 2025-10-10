/**
 * Card de Métrica Moderna - Venlo Design System
 * Baseado nas especificações Trust Blue
 */
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accent?: "orange" | "blue" | "success" | "warning" | "error";
  className?: string;
}

const accentColors = {
  orange: "border-l-venlo-orange-500",
  blue: "border-l-trust-blue-500",
  success: "border-l-success",
  warning: "border-l-warning",
  error: "border-l-error",
};

const trendColors = {
  up: "text-success",
  down: "text-error",
  neutral: "text-trust-blue-500",
};

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = "neutral",
  accent = "orange",
  className,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-white dark:bg-trust-blue-800 rounded-venlo-lg p-5",
        "border-l-4",
        accentColors[accent],
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-trust-blue-500 dark:text-trust-blue-200">
            {title}
          </p>
          <p className="text-3xl font-bold text-trust-blue-900 dark:text-white mt-2">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn("text-sm font-medium", trendColors[trend])}>
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-trust-blue-400 dark:text-trust-blue-300">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-venlo-orange-100 dark:bg-venlo-orange-900/20 rounded-venlo">
            <Icon className="h-6 w-6 text-venlo-orange-600 dark:text-venlo-orange-500" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
