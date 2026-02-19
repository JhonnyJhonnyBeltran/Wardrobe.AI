'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
    
    // Redirect to the new preferences onboarding
    useEffect(() => {
        router.replace('/onboarding/preferences');
    }, [router]);
    
    return null;
}
