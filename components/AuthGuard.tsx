"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/store/userStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Redirect if unauthorized
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-[var(--background)]">
        <Image src="/klozet-logo-dark.png" className="hidden dark:block object-contain animate-pulse" width={120} height={120} alt="Cargando..." priority />
        <Image src="/klozet-logo.png" className="dark:hidden block object-contain animate-pulse" width={120} height={120} alt="Cargando..." priority />
      </div>
    );
  }

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
