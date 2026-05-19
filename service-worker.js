/* ═══════════════════════════════════════════════════════════════════════════════
   ERTIQA SERVICE WORKER v9 — Auto-Refresh + Push + Background Sync
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Version Stamp — increments every build ───
const VERSION = 'ertiqa-v9';
const CACHE_NAME = `${VERSION}-cache`;

// ═══════════════════════════════════════════════════════════════════════════
//  INSTALL — Skip waiting immediately, no old cache
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('install', (e) => {
  console.log(`[SW] Installing ${VERSION}...`);
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll([
      '/',
      '/index.html',
      '/manifest.json',
      '/pwa-icon-192.png',
      '/assets/arkan-logo.jpg',
    ])).catch(() => {})
  );
});

// ═══════════════════════════════════════════════════════════════════════════
//  ACTIVATE — Delete ALL old caches immediately
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('activate', (e) => {
  console.log(`[SW] Activating ${VERSION}...`);
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// ═══════════════════════════════════════════════════════════════════════════
//  FETCH — Network-first strategy (always get fresh content)
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  if (request.url.includes('supabase.co')) return;
  if (request.url.includes('googleapis.com')) return;

  // Network-first: try network first, fallback to cache
  e.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(cached => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('/index.html');
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// ═══════════════════════════════════════════════════════════════════════════
//  PUSH — Notifications from cloud
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (e) => {
  let data = { title: 'زيارة جديدة — ارتقاء', body: 'وصلتك زيارة جديدة' };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-72.png',
      dir: 'rtl',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: { url: '/' },
    })
  );
});

// ── Notification click ──
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const c of clients) if (c.url.includes('/') && 'focus' in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

// ═══════════════════════════════════════════════════════════════════════════
//  LOCAL PUSH — Show notification from app
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('message', (e) => {
  if (e.data?.type === 'LOCAL_PUSH') {
    const { title, body, tag } = e.data;
    self.registration.showNotification(title || 'زيارة جديدة', {
      body: body || '',
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-72.png',
      dir: 'rtl',
      tag: tag || 'ertiqa',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: { url: '/' },
    });
  }
  // Tell all clients to refresh when new version is available
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
