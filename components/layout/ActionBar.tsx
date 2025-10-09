/**
 * ActionBar Component
 * Área de ações contextuais por página
 */
"use client";

interface ActionBarProps {
  children: React.ReactNode;
}

export function ActionBar({ children }: ActionBarProps) {
  if (!children) return null;

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {children}
    </div>
  );
}
