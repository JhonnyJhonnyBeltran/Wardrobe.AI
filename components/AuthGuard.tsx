"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/store/userStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [readyToRedirect, setReadyToRedirect] = useState(false);

  // Check on mount if there's a cached user in localStorage.
  // This is used to decide whether to apply a grace period before redirecting.
  const hadCachedUser = useRef<boolean>(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      hadCachedUser.current = !!localStorage.getItem('wardrobe_user_profile');
    }
  }, []);

  useEffect(() => {
    // If we have a user, cancel any pending redirect and stay.
    if (user) {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
      setReadyToRedirect(false);
      return;
    }

    // Loading is still in progress — do nothing yet.
    if (isLoading) return;

    // isLoading = false, no user.
    if (hadCachedUser.current) {
      // Had a cached session: apply a grace period to let Supabase re-confirm
      // the token (handles slow token refresh in production / mobile).
      if (!redirectTimer.current) {
        redirectTimer.current = setTimeout(() => {
          setReadyToRedirect(true);
        }, 3000);
      }
    } else {
      // No cached session at all: redirect immediately.
      setReadyToRedirect(true);
    }

    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
        redirectTimer.current = null;
      }
    };
  }, [isLoading, user]);

  useEffect(() => {
    if (readyToRedirect && !user) {
      router.replace('/auth');
    }
  }, [readyToRedirect, user, router]);

  // CRITICAL: If there's a cached user in localStorage, render children immediately
  // without waiting for isLoading — the Supabase listener will update silently in background.
  // This eliminates the "stuck on loading" issue during SPA navigation.
  if (user) {
    return <>{children}</>;
  }

  // No user confirmed yet.
  if (isLoading || !readyToRedirect) {
    // Still loading or in grace period — show spinner
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-[var(--background)]">
        <Image src="/klozet-logo-dark.png" className="hidden dark:block object-contain animate-pulse" width={120} height={120} alt="Cargando..." priority />
        <Image src="/klozet-logo.png" className="dark:hidden block object-contain animate-pulse" width={120} height={120} alt="Cargando..." priority />
      </div>
    );
  }

  // readyToRedirect=true but user is still null — show brief redirect state
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-[var(--background)]">
      <Image src="/klozet-logo-dark.png" className="hidden dark:block object-contain animate-pulse" width={120} height={120} alt="Redirigiendo..." priority />
      <Image src="/klozet-logo.png" className="dark:hidden block object-contain animate-pulse" width={120} height={120} alt="Redirigiendo..." priority />
    </div>
  );
}
