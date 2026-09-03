// Carl Summer Plan Refined — Service Worker
// v10: Full teal / yellow / hot-pink reskin. App icon replaced with a yellow
//      calendar glyph and hot-pink CS monogram on a teal background
//      (icon-192.png, icon-512.png regenerated). manifest.json theme_color
//      and background_color moved to brand teal (#0FA8A0) so the status bar
//      and splash screen match the icon. index.html design tokens rewired:
//      page background, ink, session-type badges/spines, today-bar, active
//      tab fill and the deload banner all recoloured — see the DESIGN TOKENS
//      block in index.html for the full palette. No markup or JS logic
//      changed. Cache version bump is required because icons and manifest
//      are served cache-first.
//      network-first for the app shell so plan updates land on next open,
//      cache-first for icons/manifest. Still fully offline-capable.

const CACHE_NAME = 'summer-plan-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isShell =
    req.mode === 'navigate' ||
    (url.origin === self.location.origin &&
      (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')));

  if (isShell) {
    // Network-first: always try for the newest plan, fall back to cache offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', clone));
          return res;
        })
        .catch(() => caches.match('./index.html').then((c) => c || caches.match('./')))
    );
    return;
  }

  // Everything else: cache-first.
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return res;
      })
    ).catch(() => caches.match('./index.html'))
  );
});
