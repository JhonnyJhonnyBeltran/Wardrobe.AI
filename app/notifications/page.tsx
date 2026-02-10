'use client';

/**
 * Activity Page (Notifications)
 * Displays likes, follows, and system prompts.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, UserPlus, X, BellOff } from 'lucide-react';
import { useUser } from '@/store/userStore';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { LogoMark } from '@/components';
import { useSwipe } from '@/hooks/useSwipe';
import { useRouter } from 'next/navigation';

// Types
interface Notification {
  id: string;
  type: 'like' | 'follow' | 'system';
  actor?: {
    name: string;
    avatar: string;
  };
  content?: string;
  time: string;
  image?: string; // For liked posts
}

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Always start loading when effect runs
      setLoading(true);

      if (!user) {
        // user not ready yet, keep loading or just return empty?
        // if we return loading=false here, it will flash empty.
        // But since useUser handles initial loading, user might be null briefly.
        setLoading(false);
        return;
      };

      const realNotifications: Notification[] = [];
      const now = new Date();

      // 1. System Notification - Every 9 days logic
      const lastMsgDate = localStorage.getItem('last_klozet_msg_date');
      const dismissedMsgId = localStorage.getItem('dismissed_system_msg_id');
      const nineDaysMs = 9 * 24 * 60 * 60 * 1000;

      // Simple ID generation for current period (e.g. week number) or just time-based check
      const currentSystemMsgId = `sys-${Math.floor(now.getTime() / nineDaysMs)}`;

      let shouldShowSystemMsg = false;

      if (dismissedMsgId !== currentSystemMsgId) {
        if (!lastMsgDate) {
          shouldShowSystemMsg = true;
        } else {
          const last = new Date(lastMsgDate);
          if (now.getTime() - last.getTime() > nineDaysMs) {
            shouldShowSystemMsg = true;
          }
        }
      }

      if (shouldShowSystemMsg) {
        realNotifications.push({
          id: currentSystemMsgId,
          type: 'system',
          content: '¡Hola! Han pasado unos días. ¿Qué tal si subes tu outfit de hoy o le pides consejo a Kloe?',
          time: 'Justo ahora',
          actor: { name: 'Klozet', avatar: '' }
        });
      }

      // 2. Fetch Follows (Real Data)
      try {
        const { data: follows, error } = await supabase
          .from('follows')
          .select(`
                    id,
                    created_at,
                    follower:profiles!follower_id (
                        username,
                        avatar_url,
                        full_name
                    )
                `)
          .eq('following_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (follows && !error) {
          follows.forEach((f: any) => {
            realNotifications.push({
              id: f.id,
              type: 'follow',
              actor: {
                name: f.follower?.full_name || f.follower?.username || 'Usuario',
                avatar: f.follower?.avatar_url || 'https://i.pravatar.cc/150?u=default'
              },
              time: new Date(f.created_at).toLocaleDateString(),
            });
          });
        }
      } catch (err) {
        console.error("Error fetching follows", err);
      } finally {
        setLoading(false);
      }

      setNotifications(realNotifications);
    };

    fetchNotifications();
  }, [user]);

  const handleDismissSystem = (id: string) => {
    // Mark as dismissed in local storage
    localStorage.setItem('dismissed_system_msg_id', id);
    // Also update last msg date to reset the timer
    localStorage.setItem('last_klozet_msg_date', new Date().toISOString());

    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const hasSystem = notifications.some(n => n.type === 'system');
  const activityNotifications = notifications.filter(n => n.type !== 'system');
  const isEmpty = notifications.length === 0;

  const router = useRouter();
  const swipeHandlers = useSwipe({
    onSwipeRight: () => router.push('/closet'),
    onSwipeLeft: () => router.push('/profile')
  });

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen bg-[var(--background)] pb-24 flex flex-col"
    >
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-14 flex items-center justify-center">
        <h1 className="text-lg font-bold text-[var(--foreground)]">Actividad</h1>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-pink)] border-t-transparent animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[50vh]">
          <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-tertiary)]">
            <BellOff className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg font-medium text-[var(--foreground)]">Estás al día</p>
          <p className="text-sm text-[var(--foreground-tertiary)]">No tienes notificaciones nuevas</p>
        </div>
      ) : (
        <div className="p-4 space-y-8 flex-1">
          {/* Automated System Messages (Top Priority) */}
          <AnimatePresence>
            {hasSystem && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Recordatorios</h2>
                {notifications.filter(n => n.type === 'system').map(notif => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                    className="relative p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--brand-pink)]/20 flex items-start gap-4 pr-10"
                  >
                    <button
                      onClick={() => handleDismissSystem(notif.id)}
                      className="absolute top-2 right-2 p-1 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      <LogoMark size="sm" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)] text-sm">Consejo de Estilo</h3>
                      <p className="text-sm text-[var(--foreground-secondary)] mt-1">{notif.content}</p>
                    </div>
                  </motion.div>
                ))}
              </section>
            )}
          </AnimatePresence>

          {/* Contexto §4G: Agrupación de likes/comentarios y seguidos */}
          {activityNotifications.filter(n => n.type === 'follow').length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Seguidos</h2>
              <div className="space-y-4">
                {activityNotifications.filter(n => n.type === 'follow').map((notif) => (
                  <div key={notif.id} className="flex items-center gap-3 group">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden relative border border-[var(--border-color)]">
                        <Image src={notif.actor!.avatar} alt={notif.actor!.name} fill className="object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--background)] flex items-center justify-center text-white bg-[var(--brand-pink)]">
                        <UserPlus className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="flex-1 text-sm">
                      <span className="font-semibold text-[var(--foreground)]">{notif.actor!.name}</span>
                      <span className="text-[var(--foreground-secondary)]"> comenzó a seguirte.</span>
                      <span className="text-[var(--foreground-tertiary)] text-xs ml-2">{notif.time}</span>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-semibold hover:opacity-90 transition-opacity">
                      Seguir
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          {activityNotifications.filter(n => n.type === 'like').length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Likes</h2>
              <div className="space-y-4">
                {activityNotifications.filter(n => n.type === 'like').map((notif) => (
                  <div key={notif.id} className="flex items-center gap-3 group">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden relative border border-[var(--border-color)]">
                        <Image src={notif.actor!.avatar} alt={notif.actor!.name} fill className="object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--background)] flex items-center justify-center text-white bg-[#FF3040]">
                        <Heart className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 text-sm">
                      <span className="font-semibold text-[var(--foreground)]">{notif.actor!.name}</span>
                      <span className="text-[var(--foreground-secondary)]"> le gustó tu post.</span>
                      <span className="text-[var(--foreground-tertiary)] text-xs ml-2">{notif.time}</span>
                    </div>
                    {notif.image && (
                      <div className="w-10 h-10 rounded-md overflow-hidden relative border border-[var(--border-color)]">
                        <Image src={notif.image} alt="Post" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
