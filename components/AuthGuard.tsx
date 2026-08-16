"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/store/userStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // Allow public pages (onboarding and auth)
  const publicPaths = ['/', '/auth'];
  const isPublicPath = publicPaths.includes(pathname || '') || pathname?.startsWith('/auth/');

  // Redirect if unauthorized
  React.useEffect(() => {
    if (!isLoading && !isPublicPath && !user) {
      router.replace('/auth');
    }
  }, [isLoading, isPublicPath, user, router]);

  // If it's a public path, we can allow rendering even if loading,
  // to avoid getting stuck on a blank screen for visitors.
  if (isLoading && !isPublicPath) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-[var(--background)]">
        <Image src="/klozet-logo-dark.png" className="hidden dark:block object-contain animate-pulse" width={120} height={120} alt="Cargando..." priority />
        <Image src="/klozet-logo.png" className="dark:hidden block object-contain animate-pulse" width={120} height={120} alt="Cargando..." priority />
      </div>
    );
  }

  // If public path, allow access
  if (isPublicPath) return <>{children}</>;

  if (!user) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-[var(--background)]">
        <Image src="/klozet-logo-dark.png" className="hidden dark:block object-contain animate-pulse" width={120} height={120} alt="Redirigiendo..." priority />
        <Image src="/klozet-logo.png" className="dark:hidden block object-contain animate-pulse" width={120} height={120} alt="Redirigiendo..." priority />
      </div>
    );
  }

  return <>{children}</>;
}
