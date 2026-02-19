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
  useEffect(() => {
    if (!isLoading && user && !user.styleCompleted && !isOnboarding) {
      router.replace('/onboarding/preferences');
    }
  }, [user, isLoading, isOnboarding, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[var(--foreground-tertiary)]">Cargando...</p>
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
  if (user && !user.styleCompleted && !isOnboarding) {
    return null;
  }

  return <>{children}</>;
}
