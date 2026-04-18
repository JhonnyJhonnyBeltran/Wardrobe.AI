"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Button } from '@/components';
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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--background)] animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center mb-8">
           {/* Outer rotating dashed ring */}
           <div className="absolute inset-0 border-4 border-dashed border-[var(--brand-pink)]/30 rounded-full animate-[spin_3s_linear_infinite]" />
           {/* Inner rotating solid ring */}
           <div className="absolute inset-0 border-4 border-[var(--brand-pink)] rounded-full animate-[spin_1.5s_linear_infinite] border-t-transparent border-r-transparent" />
           {/* Center Icon with pulse */}
           <div className="w-20 h-20 bg-[var(--background-secondary)] rounded-full flex items-center justify-center overflow-hidden p-4 shadow-xl animate-pulse">
             <img src="/klozet-logo-dark.png" alt="Cargando" className="w-full h-full object-contain dark:invert opacity-80" />
           </div>
        </div>
        <p className="text-base font-bold text-[var(--foreground)] tracking-wide">
          {isRecovering ? 'Restaurando sesión...' : 'Cargando...'}
        </p>
        <p className="text-xs text-[var(--foreground-secondary)] mt-2">
          {isRecovering ? 'Estamos verificando tus credenciales' : 'Preparando tu armario virtual'}
        </p>
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
