/* Blockloom offline worker. Network-first so local development stays fresh;
   every successful response is cached, and offline requests fall back to it. */
const CACHE = 'blockloom-v1.10.0';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-512-maskable.png',
  './assets/fonts/space-grotesk.woff2',
  './assets/fonts/ibm-plex-mono-400.woff2',
  './assets/fonts/ibm-plex-mono-500.woff2',
  './assets/fonts/silkscreen.woff2',
  './js/app.js',
  './js/engine.js',
  './js/ai.js',
  './js/finisher.js',
  './js/library.js',
  './js/resourcepack.js',
  './js/zip.js',
  './js/share.js',
  './js/importer.js',
  './js/update.js',
  './js/version.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('blockloom-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, fallback) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    if (fallback) return caches.match(fallback);
    return new Response('Offline and not cached.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, './index.html'));
    return;
  }
  event.respondWith(networkFirst(event.request));
});
