'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/store/userStore';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore';

const DAILY_STORAGE_KEY_PREFIX = 'klozet_daily_scheduled_reminder_';
const COORDS_CACHE_KEY = 'klozet_weather_coords_cache';
const TARGET_HOURS = [8, 15, 16]; // 08:00, 15:00, 16:00

interface WeatherSnapshot {
  temperature: number;
  weatherCode: number;
  isSunny: boolean;
}

function getSeasonByMonth(monthZeroIndexed: number): 'winter' | 'spring' | 'summer' | 'autumn' {
  // Hemisferio norte por defecto (España / Europa)
  if (monthZeroIndexed === 11 || monthZeroIndexed === 0 || monthZeroIndexed === 1) return 'winter';
  if (monthZeroIndexed >= 2 && monthZeroIndexed <= 4) return 'spring';
  if (monthZeroIndexed >= 5 && monthZeroIndexed <= 8) return 'summer';
  return 'autumn';
}

async function fetchLocalWeatherIfAvailable(): Promise<WeatherSnapshot | null> {
  if (typeof window === 'undefined') return null;

  try {
    let coords: { lat: number; lon: number } | null = null;
    const cachedRaw = localStorage.getItem(COORDS_CACHE_KEY);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lon === 'number') {
        coords = parsed;
      }
    }

    // If not cached, check if geolocation permission is already granted without prompting intrusively
    if (!coords && 'permissions' in navigator && 'geolocation' in navigator) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (perm.state === 'granted') {
          coords = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(c));
                resolve(c);
              },
              () => resolve(null),
              { timeout: 3500, maximumAge: 6 * 60 * 60 * 1000 }
            );
          });
        }
      } catch {
        // Ignore permission query error
      }
    }

    if (!coords) return null;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat.toFixed(3)}&longitude=${coords.lon.toFixed(3)}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const cw = data?.current_weather;
    if (!cw || typeof cw.temperature !== 'number') return null;

    const code = Number(cw.weathercode ?? 0);
    const isSunny = code === 0 || code === 1 || code === 2;
    return {
      temperature: cw.temperature,
      weatherCode: code,
      isSunny,
    };
  } catch {
    return null;
  }
}

async function buildContextualDailyReminder(hour: number): Promise<{
  title: string;
  message: string;
  targetUrl: string;
}> {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const season = getSeasonByMonth(now.getMonth());
  const weather = await fetchLocalWeatherIfAvailable();

  // Afternoon slot (15:00 or 16:00) or odd days prioritize wardrobe digitization + math pain point
  const preferUploadPrompt = hour === 15 || hour === 16 ? dayOfYear % 2 === 0 : dayOfYear % 3 === 0;

  if (preferUploadPrompt) {
    const uploadVariants = [
      {
        title: 'Sube una prenda hoy a tu armario',
        message:
          'Sube una prenda hoy: estás más cerca de digitalizar tu armario entero. 15 minutos ahora te ahorran 91 horas al año frente al espejo.',
        targetUrl: '/closet?action=new-item',
      },
      {
        title: 'Tu armario digital crece contigo',
        message:
          'Sube una prenda hoy y estarás más cerca de tener todo tu armario en el bolsillo. Digitalizar tu ropa te ahorra casi 4 días completos al año.',
        targetUrl: '/closet?action=new-item',
      },
    ];
    return uploadVariants[dayOfYear % uploadVariants.length];
  }

  // Weather & Seasonality aware prompt
  if (weather) {
    if (weather.isSunny && weather.temperature >= 20) {
      return {
        title: `Hace sol (${Math.round(weather.temperature)}°C) · Saca tus looks a pasear`,
        message:
          'Hace sol hoy: saca tus looks de verano y buen tiempo a pasear o pídele a Kloe que te arme el outfit del día.',
        targetUrl: '/closet',
      };
    }
    if (weather.temperature < 13) {
      return {
        title: `Hoy refresca (${Math.round(weather.temperature)}°C) · Looks de invierno`,
        message:
          'Saca tus looks de invierno y abrigos a pasear hoy. Planifícalo gratis en tu calendario o consulta a Kloe.',
        targetUrl: '/closet',
      };
    }
    return {
      title: `Tiempo suave (${Math.round(weather.temperature)}°C) · Saca tus looks`,
      message:
        'Hace buen día para sacar tus looks de entretiempo a pasear. Sube una prenda hoy o combina tu armario en segundos.',
      targetUrl: '/closet',
    };
  }

  // Fallback by current season if location isn't shared
  if (season === 'summer') {
    return {
      title: 'Hace sol · Saca tus looks de verano a pasear',
      message:
        'Saca tus looks de verano a pasear hoy y sube una prenda nueva para seguir completando tu armario digital.',
      targetUrl: '/closet',
    };
  }

  if (season === 'winter') {
    return {
      title: 'Saca tus looks de invierno a pasear',
      message:
        'Prepara tus capas y looks de invierno para hoy. Sube una prenda más: estás más cerca de digitalizar tu armario entero.',
      targetUrl: '/closet',
    };
  }

  return {
    title: 'Saca tus mejores looks a pasear hoy',
    message:
      'Sube una prenda hoy: estás más cerca de digitalizar tu armario entero y ahorrar 91 horas al año eligiendo qué ponerte.',
    targetUrl: '/closet?action=new-item',
  };
}

export function usePeriodicReminders() {
  const { user } = useUser();
  const addNotification = useRealtimeStore((state) => state.addNotification);
  const { settings } = useNotificationSettingsStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerScheduledReminder = async (hour: number, todayKey: string, storageKey: string) => {
    if (!user) return;
    if (!settings.reminders) return;

    // Mark as sent for today immediately to prevent duplicate triggers
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, todayKey);
    }

    const item = await buildContextualDailyReminder(hour);
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

    // 2. Trigger Native Desktop/Mobile Notification if allowed & permission granted
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
          tag: 'klozet-daily-reminder',
        });

        desktopNotif.onclick = () => {
          window.focus();
          window.location.href = item.targetUrl;
          desktopNotif.close();
        };
      } catch (err) {
        console.warn('Could not show native notification:', err);
      }
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const storageKey = `${DAILY_STORAGE_KEY_PREFIX}${user.id}`;

    const checkSchedule = () => {
      if (typeof window === 'undefined') return;
      const now = new Date();
      const currentHour = now.getHours();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

      const lastSentDate = localStorage.getItem(storageKey);
      if (lastSentDate === todayKey) {
        return; // Already sent today's scheduled notification
      }

      // Trigger if user is in one of the scheduled windows: 08:00, 15:00, or 16:00
      if (TARGET_HOURS.includes(currentHour)) {
        triggerScheduledReminder(currentHour, todayKey, storageKey);
      }
    };

    // Check shortly after mount and then every 10 minutes to catch 08:00, 15:00, or 16:00 windows
    const initialTimeout = setTimeout(checkSchedule, 4000);
    timerRef.current = setInterval(checkSchedule, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user?.id, settings.reminders, settings.popupToasts]);
}
