const CACHE_NAME = "vit-shuttle-app-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./signup.html",
  "./student.html",
  "./driver-login.html",
  "./driver.html",
  "./styles.css",
  "./app.js",
  "./auth.js",
  "./driver-auth.js",
  "./google-config.js",
  "./manifest.webmanifest",
  "./icons/app-icon.svg",
  "./icons/app-icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (!response.ok || !event.request.url.startsWith(self.location.origin)) {
          return response;
        }

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
