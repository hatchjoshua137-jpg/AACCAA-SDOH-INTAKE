/* SDOH Assessment Tool — offline cache.
   Network-first so updates roll out immediately; cached copy serves the
   blank form when the navigator is offline. No participant data passes
   through or is stored by this worker. */
const CACHE = 'sdoh-intake-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then((m) => m || caches.match('./index.html'))
      )
  );
});
