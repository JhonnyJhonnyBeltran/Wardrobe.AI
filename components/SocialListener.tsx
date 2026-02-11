'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { getPendingRequestsCount } from '@/lib/services/followService';

export default function SocialListener() {
  const { user } = useUser();
  const { setRequestsCount } = useUiStore();

  useEffect(() => {
    if (!user) return;

    // 1. Initial fetch of count
    const fetchCount = async () => {
      const count = await getPendingRequestsCount(user.id);
      console.log('[SocialListener] Pending requests count:', count);
      setRequestsCount(count);
    };

    fetchCount();

    // 2. Polling fallback (every 30 seconds) - for when realtime isn't configured
    const pollInterval = setInterval(fetchCount, 30000);

    // 3. Real-time Subscription (requires Supabase Realtime enabled for follows table)
    const channel = supabase
      .channel('social-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[SocialListener] Realtime event:', payload.eventType);
          fetchCount();
        }
      )
      .subscribe((status) => {
        console.log('[SocialListener] Subscription status:', status);
      });

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [user, setRequestsCount]);

  return null; // Renderless component
}
