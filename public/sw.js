/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

export {};

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options: NotificationOptions = {
    body: data.body || '',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: data.tag || 'klozet-notification',
    data: data.data || {},
    vibrate: [100, 50, 100],
    renotify: true,
    requireInteraction: false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Klozet', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};

  // Handle notification click
  if (data.url) {
    event.waitUntil(
      self.clients.openWindow(data.url)
    );
  } else {
    // Default: open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // If there's already a window open, focus it
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});

self.addEventListener('message', (event) => {
  // Handle messages from the main app
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Listen for activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated...');
  event.waitUntil(self.clients.claim());
});
