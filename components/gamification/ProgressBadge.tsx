/**
 * Sistema de Gamificação - Progress Badge
 * Medals: Gold, Silver, Bronze
 */
"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeType = "gold" | "silver" | "bronze" | "star" | "trophy";

interface ProgressBadgeProps {
  type: BadgeType;
  label: string;
  unlocked?: boolean;
  progress?: number;
  className?: string;
}

const badgeConfig = {
  gold: {
    icon: Trophy,
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold",
  },
  silver: {
    icon: Trophy,
    color: "text-silver",
    bg: "bg-silver/10",
    border: "border-silver",
  },
  bronze: {
    icon: Trophy,
    color: "text-bronze",
    bg: "bg-bronze/10",
    border: "border-bronze",
  },
  star: {
    icon: Star,
    color: "text-venlo-orange-500",
    bg: "bg-venlo-orange-100",
    border: "border-venlo-orange-500",
  },
  trophy: {
    icon: Target,
    color: "text-trust-blue-500",
    bg: "bg-trust-blue-100",
    border: "border-trust-blue-500",
  },
};

export function ProgressBadge({
  type,
  label,
  unlocked = false,
  progress = 0,
  className,
}: ProgressBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative p-4 rounded-venlo-lg border-2 transition-all",
        unlocked
          ? `${config.bg} ${config.border}`
          : "bg-gray-100 dark:bg-trust-blue-900 border-gray-300 dark:border-trust-blue-700 opacity-50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            unlocked
              ? `${config.bg} ${config.color}`
              : "bg-gray-200 dark:bg-trust-blue-800 text-gray-400"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p
            className={cn(
              "font-semibold text-sm",
              unlocked
                ? "text-trust-blue-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            {label}
          </p>
          {!unlocked && progress > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-trust-blue-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                  className={cn("h-full", config.color.replace("text-", "bg-"))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selo "Desbloqueado" */}
      {unlocked && (
        <motion.div
          initial={{ rotate: -45, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="absolute -top-2 -right-2 bg-success text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}
