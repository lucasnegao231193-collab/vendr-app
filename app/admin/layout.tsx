/**
 * Layout do Painel Administrativo
 */
import { ReactNode } from 'react';

export const metadata = {
  title: 'Admin - Venlo',
  description: 'Painel administrativo do Venlo',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
