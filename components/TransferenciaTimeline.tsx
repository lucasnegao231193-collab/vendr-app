/**
 * Timeline Visual para Transferências - Venlo
 * Status Flow: Enviado → Em Trânsito → Concluído
 */
"use client";

import { motion } from "framer-motion";
import { Check, Clock, Package, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type TransferenciaStatus = 
  | "aguardando_aceite" 
  | "aceito" 
  | "recusado" 
  | "cancelado";

interface TimelineStep {
  label: string;
  status: "completed" | "current" | "pending" | "rejected";
  timestamp?: Date;
  icon: React.ReactNode;
}

interface TransferenciaTimelineProps {
  status: TransferenciaStatus;
  createdAt: Date;
  acceptedAt?: Date;
  refusedAt?: Date;
  className?: string;
}

const statusConfig = {
  aguardando_aceite: {
    color: "info",
    label: "Em Trânsito",
    badge: "bg-info/10 text-info border-info/20",
  },
  aceito: {
    color: "success",
    label: "Concluído",
    badge: "bg-success/10 text-success border-success/20",
  },
  recusado: {
    color: "error",
    label: "Recusado",
    badge: "bg-error/10 text-error border-error/20",
  },
  cancelado: {
    color: "muted",
    label: "Cancelado",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function TransferenciaTimeline({
  status,
  createdAt,
  acceptedAt,
  refusedAt,
  className,
}: TransferenciaTimelineProps) {
  const steps: TimelineStep[] = [
    {
      label: "Enviado",
      status: "completed",
      timestamp: createdAt,
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: status === "recusado" ? "Recusado" : "Em Trânsito",
      status:
        status === "recusado"
          ? "rejected"
          : status === "aceito"
          ? "completed"
          : "current",
      timestamp: status === "recusado" ? refusedAt : undefined,
      icon:
        status === "recusado" ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        ),
    },
    {
      label: "Concluído",
      status: status === "aceito" ? "completed" : "pending",
      timestamp: acceptedAt,
      icon: <Check className="h-4 w-4" />,
    },
  ];

  // Se foi recusado, remover o passo "Concluído"
  const filteredSteps = status === "recusado" ? steps.slice(0, 2) : steps;

  return (
    <div className={cn("py-4", className)}>
      {/* Badge de Status */}
      <div className="mb-4">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
            statusConfig[status].badge
          )}
        >
          {statusConfig[status].label}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {filteredSteps.map((step, index) => {
          const isLast = index === filteredSteps.length - 1;
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          const isRejected = step.status === "rejected";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4 pb-8 last:pb-0"
            >
              {/* Linha conectora */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-3 top-8 bottom-0 w-0.5",
                    isCompleted || isRejected
                      ? isRejected
                        ? "bg-error/30"
                        : "bg-success/30"
                      : "bg-gray-200 dark:bg-trust-blue-700"
                  )}
                />
              )}

              {/* Ícone */}
              <div
                className={cn(
                  "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0",
                  isCompleted
                    ? "bg-success border-success text-white"
                    : isRejected
                    ? "bg-error border-error text-white"
                    : isCurrent
                    ? "bg-info border-info text-white animate-pulse"
                    : "bg-white dark:bg-trust-blue-800 border-gray-300 dark:border-trust-blue-600 text-gray-400"
                )}
              >
                {step.icon}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent || isRejected
                      ? "text-trust-blue-900 dark:text-white"
                      : "text-gray-400 dark:text-trust-blue-500"
                  )}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-xs text-trust-blue-500 dark:text-trust-blue-300 mt-0.5">
                    {step.timestamp.toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
