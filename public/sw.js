// Service Worker for Bloom Journey Push Notifications
const CACHE_NAME = 'bloom-journey-v1';
const NOTIFICATION_CACHE = 'notifications-v1';

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/home',
          '/profile',
          '/chat',
          '/timeline',
          '/meals',
          '/yoga',
          '/resources'
        ]);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== NOTIFICATION_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Bloom Journey',
    body: 'You have a new reminder!',
    icon: '/images/icon.png',
    badge: '/images/icon.png',
    tag: 'bloom-journey-notification',
    data: {
      url: '/home'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Error parsing notification data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/images/icon.png'
      }
    ],
    vibrate: [200, 100, 200],
    sound: 'default'
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(event.notification.data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/home');
        }
      })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);
  
  if (event.tag === 'background-notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Function to sync notifications in background
async function syncNotifications() {
  try {
    // This would typically fetch new notifications from your API
    // For now, we'll just log the sync attempt
    console.log('Syncing notifications in background...');
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Message event for communication with main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 