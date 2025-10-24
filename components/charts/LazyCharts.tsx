/**
 * Lazy Loading Wrapper para Charts
 * Otimiza o carregamento inicial da aplicação
 */
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load dos componentes de gráfico
export const SalesChart = dynamic(
  () => import('./SalesChart').then(mod => ({ default: mod.SalesChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
    ssr: false, // Charts não funcionam no SSR
  }
);

export const ProductChart = dynamic(
  () => import('./SalesChart').then(mod => ({ default: mod.ProductChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
    ssr: false,
  }
);

export const PerformanceChart = dynamic(
  () => import('./SalesChart').then(mod => ({ default: mod.PerformanceChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
    ssr: false,
  }
);

// Lazy load do componente de Analytics
export const AnalyticsChart = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Line })),
  {
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
    ssr: false,
  }
);
