/**
 * PageHeader - Header com título, breadcrumbs e botões Voltar/Home
 */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  showHomeButton?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  showBackButton = true,
  showHomeButton = true,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("mb-6", className)}>
      {/* Botões Voltar/Home */}
      {(showBackButton || showHomeButton) && (
        <div className="flex items-center gap-2 mb-4">
          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}

          {showHomeButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
              aria-label="Ir para Dashboard"
            >
              <Home className="h-4 w-4" />
              Início
            </Button>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {item.href ? (
                <button
                  onClick={() => router.push(item.href!)}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Título e Ações */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
