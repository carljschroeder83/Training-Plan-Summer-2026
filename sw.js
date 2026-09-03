// Carl Summer Plan Refined — Service Worker
// v9: App icon replaced. New roundel mark — teal disc on a bright yellow field,
//     with a navy running figure above the CS monogram and a navy dumbbell below,
//     stacked on a single vertical axis. Both icon-192.png and icon-512.png
//     regenerated; all content sits inside the maskable safe circle so Android's
//     circular crop does not clip it. Cache version bump is required because
//     icons are served cache-first.
//     network-first for the app shell so plan updates land on next open,
//     cache-first for icons/manifest. Still fully offline-capable.

const CACHE_NAME = 'summer-plan-v9';
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
