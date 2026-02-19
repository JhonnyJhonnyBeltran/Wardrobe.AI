/**
 * Push Notification Service
 * Handles push notifications for mobile devices
 * Uses Web Push API with VAPID authentication
 */

import { supabase } from './supabase/client';

// VAPID keys - In production, these should be environment variables
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

class PushNotificationService {
  private subscription: PushSubscription | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'PushManager' in window && 'serviceWorker' in navigator;
    }
  }

  /**
   * Check if push notifications are supported
   */
  isPushSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Request permission for push notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
      });

      this.subscription = subscription;

      // Save subscription to database
      await this.saveSubscription(userId, subscription);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(userId: string): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Remove from database
      await this.removeSubscription(userId);
      
      this.subscription = null;
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  }

  /**
   * Send a local notification (for testing)
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return;
    }

    const permission = this.getPermissionStatus();
    if (permission !== 'granted') {
      const newPermission = await this.requestPermission();
      if (newPermission !== 'granted') {
        return;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        tag: payload.tag,
        data: payload.data,
        renotify: true,
        requireInteraction: false,
      } as NotificationOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Save subscription to database
   */
  private async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    const subscriptionData = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.toJSON().keys?.p256dh || '',
      auth: subscription.toJSON().keys?.auth || '',
      created_at: new Date().toISOString(),
    };

    // Store in localStorage for now (can be expanded to database)
    try {
      const existing = localStorage.getItem('push_subscriptions');
      const subscriptions = existing ? JSON.parse(existing) : [];
      
      // Remove old subscription for this user
      const filtered = subscriptions.filter((s: any) => s.user_id !== userId);
      filtered.push(subscriptionData);
      
      localStorage.setItem('push_subscriptions', JSON.stringify(filtered));
    } catch (e) {
      console.error('Error saving subscription to localStorage:', e);
    }
  }

  /**
   * Remove subscription from database
   */
  private async removeSubscription(userId: string): Promise<void> {
    try {
      const existing = localStorage.getItem('push_subscriptions');
      if (existing) {
        const subscriptions = JSON.parse(existing);
        const filtered = subscriptions.filter((s: any) => s.user_id !== userId);
        localStorage.setItem('push_subscriptions', JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Error removing subscription:', e);
    }
    
    localStorage.removeItem('push_subscription');
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Test notification
   */
  async sendTestNotification(): Promise<void> {
    await this.showNotification({
      title: 'Klozet Notifications',
      body: 'Push notifications are working!',
      icon: '/icon-192x192.png',
      tag: 'test',
    });
  }
}

// Export singleton instance
export const pushNotifications = new PushNotificationService();

// Export hook for React components
export function usePushNotifications() {
  return pushNotifications;
}
