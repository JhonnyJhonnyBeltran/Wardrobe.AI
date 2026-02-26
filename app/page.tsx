'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LogoExtended } from '@/components';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirección inmediata (No Landing Page strategy)
  useEffect(() => {
    if (loading) return;

    if (user) {
      router.push('/closet');
    } else {
      router.push('/auth?mode=signup');
    }
  }, [user, loading, router]);

  // Pantalla de carga super minimalista mientras se decide la ruta
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <LogoExtended size="md" className="animate-pulse opacity-50" />
    </div>
  );
}
