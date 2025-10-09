/**
 * Status Badge Component
 * Badges coloridos para diferentes status
 */
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "ativo" | "inativo" | "pendente";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const statusClasses = {
    ativo: "badge-active",
    inativo: "badge-inactive",
    pendente: "badge-pending",
  };

  const statusLabels = {
    ativo: "Ativo",
    inativo: "Inativo",
    pendente: "Pendente",
  };

  return (
    <span className={cn(baseClasses, statusClasses[status], className)}>
      {statusLabels[status]}
    </span>
  );
}
