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
    silent: false, // Enable sound for all notifications
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'mark-read',
        title: 'Mark as Read',
        icon: '/images/icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/images/icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Handle notification actions
  if (event.action === 'mark-read') {
    // Mark notification as read
    const notificationId = event.notification.data?.notificationId;
    if (notificationId) {
      // Send message to main thread to mark as read
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MARK_NOTIFICATION_READ',
            notificationId: notificationId
          });
        });
      });
    }
  } else if (event.action === 'dismiss') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes('/home') && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is already open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/home');
        }
      })
    );
  }
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'PLAY_NOTIFICATION_SOUND') {
    // Play notification sound
    playNotificationSound(event.data.notificationType);
  }
});

// Play notification sound function
function playNotificationSound(notificationType) {
  try {
    // Create audio context for notification sound
    const audioContext = new (self.AudioContext || self.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sound patterns for different notification types
    let frequencies = [];
    let durations = [];

    switch (notificationType) {
      case 'water_intake':
        frequencies = [800, 600, 800, 1000];
        durations = [0.1, 0.1, 0.1, 0.2];
        break;
      case 'baby_message':
        frequencies = [523, 659, 784, 659];
        durations = [0.15, 0.15, 0.15, 0.2];
        break;
      case 'doctor_appointment':
        frequencies = [440, 554, 659, 440];
        durations = [0.2, 0.2, 0.2, 0.3];
        break;
      default:
        frequencies = [800, 600, 800];
        durations = [0.1, 0.1, 0.2];
    }

    const startTime = audioContext.currentTime;
    let currentTime = startTime;

    frequencies.forEach((freq, index) => {
      oscillator.frequency.setValueAtTime(freq, currentTime);
      currentTime += durations[index];
    });

    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + currentTime);

    oscillator.start(startTime);
    oscillator.stop(startTime + currentTime);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
} 