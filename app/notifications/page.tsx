'use client';

/**
 * Activity Page (Notifications)
 * Displays likes, follows, and system prompts.
 * Now uses the shared NotificationList component.
 */

import { useSwipe } from '@/hooks/useSwipe';
import { useRouter } from 'next/navigation';
import NotificationList from '@/components/Notifications/NotificationList';
import { useEffect } from 'react';
import { useRealtimeStore } from '@/store/realtimeStore';

export default function NotificationsPage() {
  const router = useRouter();
  const markActivityAsViewed = useRealtimeStore(state => state.markActivityAsViewed);

  useEffect(() => {
    // Clear notifications badge when entering the page
    markActivityAsViewed();
  }, [markActivityAsViewed]);

  const swipeHandlers = useSwipe({
    onSwipeRight: () => router.push('/closet'),
    onSwipeLeft: () => router.push('/profile')
  });

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen bg-[var(--background)] pb-24 flex flex-col w-full"
    >
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-14 flex items-center justify-center">
        <h1 className="text-lg font-bold text-[var(--foreground)]">Actividad</h1>
      </header>

      {/* Full width container for the list */}
      <div className="flex-1 w-full max-w-2xl mx-auto">
        <NotificationList />
      </div>
    </div>
  );
}
