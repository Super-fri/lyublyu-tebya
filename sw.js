const CACHE = "lyublyu-tebya-v2";
const FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/teddy.png",
  "./assets/teddy-hd.svg",
  "./assets/telegram-pattern.png",
  "./assets/bears/christmas.webp",
  "./assets/bears/builder.webp",
  "./assets/bears/football.webp",
  "./assets/bears/halloween.webp",
  "./assets/bears/love-u.webp",
  "./assets/bears/luck-ground.webp",
  "./assets/bears/polar.webp",
  "./assets/bears/flowers.webp",
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match("./index.html"));
  }));
});
