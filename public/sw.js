// PASS-THROUGH SERVICE WORKER WITH PUSH SUPPORT
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
    return;
});

// PWA Push Notification Support
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Nova Notificação', body: 'Você tem uma nova atualização.' };
    
    const options = {
        body: data.body,
        icon: data.icon || '/logo-supreme.png',
        badge: '/icons.svg',
        data: data.data
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
