'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LogoExtended } from '@/components';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If there's a Supabase auth code in the URL (email confirmation callback),
    // redirect to the proper callback handler
    const code = searchParams?.get('code');
    if (code) {
      router.replace(`/auth/callback?code=${code}`);
      return;
    }

    if (loading) return;

    if (user) {
      router.push('/closet');
    } else {
      router.push('/auth?mode=signup');
    }
  }, [user, loading, router, searchParams]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <LogoExtended size="md" className="animate-pulse opacity-50" />
    </div>
  );
}
