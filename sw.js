// Service worker di Dieta Glide.
// Strategia "prima la rete, poi la cache": quando sei online prende sempre la versione
// aggiornata e la salva; quando sei offline usa l'ultima copia salvata.
// Se cambi questo file, aumenta il numero di versione per svuotare la vecchia cache.
const CACHE = 'dieta-glide-v1';
const PRECACHE = ['./', './index.html', './manifest.json', './icona.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        caches.match(event.request, { ignoreSearch: true })
          .then((hit) => hit || (event.request.mode === 'navigate' ? caches.match('./index.html') : undefined))
          .then((hit) => hit || Response.error())
      )
  );
});
