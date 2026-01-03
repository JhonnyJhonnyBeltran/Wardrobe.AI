"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Button } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Allow public pages (onboarding and auth)
  const publicPaths = ['/', '/auth'];
  const isPublicPath = publicPaths.includes(pathname || '') || pathname?.startsWith('/auth/');
  
  if (isPublicPath) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[var(--foreground-tertiary)]">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Acceso requerido</h3>
          <p className="text-sm text-[var(--foreground-tertiary)]">Inicia sesión para acceder a todas las funcionalidades.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => router.push('/auth')}>Iniciar sesión</Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
