'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClosyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/closet/kloe');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-pink)] border-t-transparent animate-spin" />
    </div>
  );
}
