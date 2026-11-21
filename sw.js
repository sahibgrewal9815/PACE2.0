/* PACE service worker — shows habit-reminder notifications. No offline caching (always fresh code). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(d.title || 'PACE', {
    body: d.body || 'Time for your habit',
    tag: d.tag || 'pace',
    renotify: true,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-96.png',
    data: { url: d.url || './app.html' },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || './app.html', self.registration.scope).href;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if (c.url.includes('app.html')) { await c.focus(); c.postMessage({ type: 'open', url }); return; } }
    await self.clients.openWindow(url);
  })());
});
