// PWA desabilitado - apenas manifest.json para instalação
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true, // Desabilitar completamente
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false, // Habilitar otimização de imagens
    domains: ['localhost'], // Adicionar domínios permitidos se necessário
    formats: ['image/webp', 'image/avif'], // Formatos modernos
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // optimizeCss: true, // Removido - causava erro com critters
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], // Otimizar imports
  },
  // Compressão
  compress: true,
  // Otimizar fontes
  optimizeFonts: true,
};

module.exports = withPWA(nextConfig);
