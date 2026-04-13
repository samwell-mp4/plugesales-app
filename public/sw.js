// PASS-THROUGH SERVICE WORKER
// This satisfies PWA installation requirements without interfering with network requests.
// Essential for Vite-based projects with dynamic asset hashing.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Let the browser handle everything normally
  return;
});
