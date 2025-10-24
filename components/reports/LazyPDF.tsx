/**
 * Lazy Loading Wrapper para PDF Generator
 * Otimiza o carregamento inicial da aplicação
 */
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load do PDF renderer
export const PDFGenerator = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Gerando PDF...</span>
      </div>
    ),
    ssr: false, // PDF não funciona no SSR
  }
);

// Lazy load dos templates de PDF
export const SalesReportPDF = dynamic(
  () => import('@/lib/reports/pdf-generator').then(mod => ({ default: mod.SalesReportPDF })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    ),
    ssr: false,
  }
);

export const StockReportPDF = dynamic(
  () => import('@/lib/reports/pdf-generator').then(mod => ({ default: mod.StockReportPDF })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    ),
    ssr: false,
  }
);
