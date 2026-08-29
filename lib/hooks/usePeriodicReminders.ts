'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/store/userStore';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore';

const REMINDER_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 Horas
const STORAGE_KEY = 'klozet_last_periodic_reminder';

const REMINDER_MESSAGES = [
  {
    title: '👗 Tu armario te espera',
    message: 'Sé que es un rollo añadir prendas, pero más rollo es no saber qué ponerte un día especial 😉. ¡Sube 3 prendas hoy a tu armario!',
    targetUrl: '/closet',
  },
  {
    title: '✨ Asesoría Kloe',
    message: '¿Tienes 2 minutos? Añade tus prendas favoritas a tu armario y deja que Kloe combine tus looks.',
    targetUrl: '/closet/kloe',
  },
  {
    title: '💡 Tip de Estilo',
    message: 'Digitaliza tu ropa favorita. Cuantas más prendas tengas en Klozet, más combinaciones inteligentes obtendrás.',
    targetUrl: '/closet',
  },
  {
    title: '🪄 ¿Qué te pondrás hoy?',
    message: '¿Dudas con qué ponerte? Pídele a Kloe que te arme un outfit en segundos con tu ropa.',
    targetUrl: '/closet/kloe',
  },
  {
    title: '🗓️ Planea tu outfit',
    message: 'Añade tus nuevas prendas para que Kloe pueda recomendarte el look ideal para esta semana.',
    targetUrl: '/closet',
  },
];

export function usePeriodicReminders() {
  const { user } = useUser();
  const addNotification = useRealtimeStore((state) => state.addNotification);
  const { settings, isNotificationTypeAllowed } = useNotificationSettingsStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerReminder = () => {
    if (!user) return;
    if (!settings.reminders) return;

    // Pick random message
    const randomIndex = Math.floor(Math.random() * REMINDER_MESSAGES.length);
    const item = REMINDER_MESSAGES[randomIndex];

    const notificationId = `reminder_${Date.now()}`;

    // 1. Add to In-App Realtime Notification Store
    addNotification({
      id: notificationId,
      sender_id: 'system',
      type: 'system',
      title: item.title,
      message: item.message,
      read: false,
      created_at: new Date().toISOString(),
      data: {
        targetUrl: item.targetUrl,
      },
      sender: {
        username: 'Klozet',
        avatar_url: '/klozet-logo-dark.png',
      },
    });

    // 2. Trigger Native Desktop Notification if allowed & permission granted
    if (
      settings.popupToasts &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const desktopNotif = new Notification(item.title, {
          body: item.message,
          icon: '/klozet-logo-dark.png',
          badge: '/klozet-logo-dark.png',
          tag: 'klozet-reminder',
        });

        desktopNotif.onclick = () => {
          window.focus();
          window.location.href = item.targetUrl;
          desktopNotif.close();
        };
      } catch (err) {
        console.warn('Could not show native desktop notification:', err);
      }
    }

    // Save timestamp
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  };

  useEffect(() => {
    if (!user) return;

    if (typeof window !== 'undefined') {
      // Always reset baseline timestamp on app mount to current session time
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    const checkReminder = () => {
      if (typeof window === 'undefined') return;
      const lastStr = localStorage.getItem(STORAGE_KEY);
      const lastTime = lastStr ? parseInt(lastStr, 10) : Date.now();
      const now = Date.now();

      if (now - lastTime >= REMINDER_INTERVAL_MS) {
        triggerReminder();
      }
    };

    // Periodic check every 30 minutes while app is running
    timerRef.current = setInterval(checkReminder, 30 * 60 * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user?.id, settings.reminders, settings.popupToasts]);
}

