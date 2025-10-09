/**
 * EmptyState Component
 * Estado vazio com CTA
 */
import { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-[var(--text-secondary)]">{icon}</div>}
      
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[var(--brand-primary)] text-white hover:opacity-90"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
