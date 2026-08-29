/**
 * Native System / Desktop & Mobile Push Notification Dispatcher
 * Sends true OS-level notifications (Windows Action Center, macOS Notification Center, Android & iOS notification trays)
 */

export interface SystemNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
  vibrate?: number[];
}

/**
 * Checks if system notifications are supported in the current environment
 */
export function isSystemNotificationSupported(): boolean {
  return typeof window !== 'undefined' && ('Notification' in window || 'serviceWorker' in navigator);
}

/**
 * Requests native system notification permission from the user
 */
export async function requestSystemNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[SystemNotification] Error requesting permission:', err);
    return 'denied';
  }
}

/**
 * Dispatches a native system notification to desktop / mobile notification center
 */
export async function sendSystemNotification(payload: SystemNotificationPayload): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const defaultIcon = '/klozet-logo-dark.png';
  const defaultBadge = '/klozet-logo-dark.png';

  const title = payload.title || 'Klozet';
  const options: NotificationOptions = {
    body: payload.body || 'Tienes nueva actividad en Klozet',
    icon: payload.icon || defaultIcon,
    badge: payload.badge || defaultBadge,
    tag: payload.tag || `klozet-${Date.now()}`,
    data: payload.data || { url: '/notifications' },
    // @ts-ignore
    vibrate: payload.vibrate || [200, 100, 200],
    renotify: true,
    requireInteraction: false
  };

  // 1. Check permission
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // 2. Try Service Worker showNotification first (Standard for mobile PWA & modern browsers)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, options);
          return true;
        }
      } catch (swErr) {
        console.warn('[SystemNotification] Service worker showNotification fallback:', swErr);
      }
    }

    // 3. Fallback to Window Notification constructor (Desktop browsers)
    const notif = new Notification(title, options);
    notif.onclick = (event) => {
      event.preventDefault();
      window.focus();
      const targetUrl = payload.data?.url || '/notifications';
      if (targetUrl) {
        window.location.href = targetUrl;
      }
      notif.close();
    };

    return true;
  } catch (err) {
    console.warn('[SystemNotification] Failed to display notification:', err);
    return false;
  }
}
