"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Button } from '@/components';
import { useUser } from '@/store/userStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // Allow public pages (onboarding and auth)
  const publicPaths = ['/', '/auth'];
  const isPublicPath = publicPaths.includes(pathname || '') || pathname?.startsWith('/auth/');
  const isOnboarding = pathname?.startsWith('/onboarding');

  // Redirect to onboarding if needed
  // useEffect removed since styleCompleted check is faulty

  // If it's a public path, we can allow rendering even if loading,
  // to avoid getting stuck on a blank screen for visitors.
  if (isLoading && !isPublicPath) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--background)] animate-in fade-in duration-500">
        <div className="w-10 h-10 border-4 border-[var(--brand-pink)]/30 border-t-[var(--brand-pink)] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[var(--foreground-secondary)] tracking-wide">Cargando tu armario...</p>
      </div>
    );
  }

  // If public path, allow access
  // Note: The useEffect above will still trigger redirect if they are logged in and incomplete style
  if (isPublicPath) return <>{children}</>;

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

  // Prevent rendering protected content if we are about to redirect

  return <>{children}</>;
}
