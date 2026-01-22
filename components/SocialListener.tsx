'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';

export default function SocialListener() {
  const { user } = useUser();
  const { setRequestsCount } = useUiStore();

  useEffect(() => {
    if (!user) return;

    // 1. Initial fetch of count
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('[SocialListener] Error fetching count:', error);
        return;
      }

      console.log('[SocialListener] Pending requests count:', count);
      setRequestsCount(count || 0);
    };

    fetchCount();

    // 2. Polling fallback (every 10 seconds) - for when realtime isn't configured
    const pollInterval = setInterval(fetchCount, 10000);

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
