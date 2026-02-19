'use client';

/**
 * ConditionalLayout - Aplica AppLayout solo a rutas autenticadas
 * Las páginas públicas (/, /auth) no tienen navbar/tabbar
 */

import { usePathname } from 'next/navigation';
import AppLayout from './AppLayout';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rutas públicas sin AppLayout (sin navbar/tabbar)
  const publicRoutes = ['/', '/auth'];
  const isPublicRoute = publicRoutes.includes(pathname || '') || pathname?.startsWith('/auth/') || pathname?.startsWith('/onboarding');

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Rutas de la app con AppLayout (navbar/tabbar)
  return <AppLayout>{children}</AppLayout>;
}
