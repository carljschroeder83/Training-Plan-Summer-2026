// Carl Summer Plan Refined — Service Worker
// v16: Plyometrics added to Thursday warm-ups in Weeks 13, 16, 17 and 19 (pogos,
//      A-skips, ankling 2×20s each), placed after the easy volume and before the
//      fast work. Deliberately omitted in Weeks 14 and 20 and on days where
//      Session H already carries them; each omission is stated in the session.
//
// v15: Clean pulls replaced with power cleans (3×3 @60-70kg, fast) in Weeks 13,
//      14, 17 and 19. Plyometrics added to every strength session, placed after
//      the lifting and before core. New plyometric and mobility protocol cards.
//      Guidance cards cut from 19 to 11 and trimmed; Session B (retired since
//      Week 10) deleted; Session A rewritten to match current prescriptions.
//
// v14: Weeks 13 and 17 VO2 sessions converted from 4× 5:00 to 4× 1200m with
//      95-97s 400m splits, now that a track is available. Recovery 3:00 -> 2:50
//      to hold the ~60% cap. Weeks 15 and 18 stay duration-based (no track on
//      the road). Title, H1 and version stamp bumped to V14.
//
// v13: Strength prescriptions revised after review. Back squat moves from 3×3 @82%
//      (nine reps, below Prilepin range) to 3×5 @80% in Weeks 13, 14 and 19;
//      Week 17 reload set at 3×5 @72%. Clean pull raised 80kg -> 95kg. Week 20
//      taper left low-rep by design. New rationale card added to the strength
//      section covering why heavy/low-volume beats high-rep for running economy.
//
// v12: Re-anchored VDOT 47 -> 48 after the official Woking result came in at
//      20:50 (not the ~21:15 the GPS file implied). All Phase 3 pace bands moved
//      4s/km faster; benchmark target 20:00-20:20. Week 12 card corrected with
//      true splits 3:54 / 4:14 / 4:19 / 4:15 / 4:08.
//
// v11: Plan extended from 16 to 20 weeks (5 Sep 2026). Phase 3 rewritten and
//      re-anchored to VDOT 47 off the Week 12 Parkrun. 5K benchmark moved from
//      Sat 3 Oct to Sat 31 Oct to clear the Ottawa (21 Sep - 3 Oct) and
//      Washington (11-18 Oct) travel blocks. Weeks 15, 16 and 18 rewritten as
//      hotel/travel maintenance with duration-based reps and dumbbell strength.
//      TOTAL_WEEKS, header copy and benchmark metrics updated in index.html.
//      Cache bump required so the new plan lands on next open.
//
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

const CACHE_NAME = 'summer-plan-v16';
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
