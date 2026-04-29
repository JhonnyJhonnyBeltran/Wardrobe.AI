'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/store';
import SessionSplash from '@/components/SessionSplash';

export default function RootPage() {
  const router = useRouter();
  // Usamos useUser en lugar de useAuth para compartir el estado de carga global y evitar condiciones de carrera
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // If there's a Supabase auth code in the URL (email confirmation callback),
    // redirect to the proper callback handler
    const code = searchParams?.get('code');
    if (code) {
      router.replace(`/auth/callback?code=${code}`);
      return;
    }

    if (isLoading) return;

    // Cuando termina de cargar, preparamos la salida del splash
    setShowSplash(false);
  }, [isLoading, searchParams, router]);

  const handleSplashComplete = () => {
    if (user) {
      router.push('/closet');
    } else {
      router.push('/auth?mode=signup');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SessionSplash 
        isLoading={showSplash} 
        onComplete={handleSplashComplete} 
      />
    </div>
  );
}
