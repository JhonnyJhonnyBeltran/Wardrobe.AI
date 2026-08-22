'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KlosyRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/closet/kloe');
  }, [router]);

  return null;
}
