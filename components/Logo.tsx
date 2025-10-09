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
  sm: { width: 100, height: 20 },
  md: { width: 150, height: 30 },
  lg: { width: 200, height: 40 },
  xl: { width: 300, height: 60 },
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
