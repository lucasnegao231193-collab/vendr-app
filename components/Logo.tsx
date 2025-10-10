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
  sm: { width: 120, height: 40 },
  md: { width: 160, height: 53 },
  lg: { width: 200, height: 66 },
  xl: { width: 240, height: 80 },
};

export function Logo({ size = "md", variant = "default", className = "" }: LogoProps) {
  const { width, height } = sizes[size];
  
  // Usar logo PNG oficial com cache bust
  const logoSrc = "/logo-vendr.png?v=2";

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src={logoSrc}
        alt="Vendr"
        width={width}
        height={height}
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  );
}
