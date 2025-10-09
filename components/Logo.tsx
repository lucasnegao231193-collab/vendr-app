/**
 * Componente Logo do Vendr
 * Reutilizável em toda a aplicação
 */
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: { width: 120, height: 32 },
  md: { width: 180, height: 48 },
  lg: { width: 240, height: 64 },
  xl: { width: 300, height: 80 },
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  const { width, height } = sizes[size];

  return (
    <Image
      src="/logo.svg"
      alt="Vendr"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
