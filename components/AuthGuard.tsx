"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Button, SessionSplash } from '@/components';
import { useUser } from '@/store/userStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refreshProfile } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isRecovering, setIsRecovering] = React.useState(false);
  const recoveryAttempted = React.useRef(false);

  // Allow public pages (onboarding and auth)
  const publicPaths = ['/', '/auth'];
  const isPublicPath = publicPaths.includes(pathname || '') || pathname?.startsWith('/auth/');
  const isOnboarding = pathname?.startsWith('/onboarding');

  // If we suspect the user was logged in but the session is currently null, 
  // try one proactive refresh before showing the "Access Required" card.
  useEffect(() => {
    const wasLoggedIn = localStorage.getItem('klozet_was_logged_in') === 'true';
    if (!isLoading && !user && wasLoggedIn && !recoveryAttempted.current && !isPublicPath) {
      console.log('[AuthGuard] User was previously logged in but session is null. Attempting silent recovery...');
      recoveryAttempted.current = true;
      setIsRecovering(true);
      refreshProfile().finally(() => setIsRecovering(false));
    }
  }, [isLoading, user, refreshProfile, isPublicPath]);

  // If it's a public path, we can allow rendering even if loading,
  // to avoid getting stuck on a blank screen for visitors.
  if ((isLoading || isRecovering) && !isPublicPath) {
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6 md:p-8 pt-safe-top animate-pulse">
        {/* Top Header Placeholder */}
        <div className="h-10 w-48 bg-[var(--background-secondary)] rounded-xl mb-6 md:mb-8"></div>
        
        {/* Grid/Feed Placeholder */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[var(--background-secondary)] rounded-2xl w-full"></div>
          ))}
        </div>
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
