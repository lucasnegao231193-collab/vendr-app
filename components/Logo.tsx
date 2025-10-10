/**
 * Componente Logo do Vendr
 * Reutilizável em toda a aplicação com suporte a variantes de cor
 */
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white";
  className?: string;
}

const sizes = {
  sm: { width: 120, height: 32 },
  md: { width: 180, height: 48 },
  lg: { width: 240, height: 64 },
  xl: { width: 300, height: 80 },
};

export function Logo({ size = "md", variant = "default", className = "" }: LogoProps) {
  const { width, height } = sizes[size];
  
  // Se for white variant, usar filtro CSS ou logo alternativa
  const logoSrc = variant === "white" ? "/logo-white.svg" : "/logo.svg";
  const filterClass = variant === "white" ? "brightness-0 invert" : "";

  return (
    <Image
      src={logoSrc}
      alt="Venlo"
      width={width}
      height={height}
      className={`${filterClass} ${className}`}
      priority
      onError={(e) => {
        // Fallback para texto se imagem não existir
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
