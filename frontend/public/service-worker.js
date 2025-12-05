const CACHE_NAME = "modulift-client-v1";

const URLS_TO_CACHE = [
    "/",
    "/index.html",
];

// INSTALL
self.addEventListener("install", (event) => {
    console.log("[SW] Install");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[SW] Caching shell");
            return cache.addAll(URLS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
    console.log("[SW] Activate");
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => {
                        console.log("[SW] Removing old cache:", key);
                        return caches.delete(key);
                    })
            )
        )
    );
    self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // ❌ 1) ignora TUTTO ciò che non è http/https (es. chrome-extension://)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return;
    }

    // ❌ 2) ignora le API backend (lasciamo a fetch/axios)
    if (url.pathname.startsWith("/api/")) {
        return;
    }

    // ✅ 3) Navigazione SPA → network first con fallback a index.html
    //    (vale per TUTTE le route: /cliente/..., /admin/..., ecc.)
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => {
                console.log("[SW] Offline, serve index.html dalla cache");
                return caches.match("/index.html");
            })
        );
        return;
    }

    // ✅ 4) Asset statici SAME-ORIGIN (JS, CSS, immagini, font) → cache first
    if (
        url.origin === self.location.origin &&
        (
            request.destination === "script" ||
            request.destination === "style" ||
            request.destination === "image" ||
            request.destination === "font"
        )
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            // qui ora sono sicuro che è http/https e same-origin
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });
                    })
                    .catch(() => {
                        // se proprio non c'è nulla, error generico
                        return cachedResponse || Response.error();
                    });
            })
        );
        return;
    }

    // tutto il resto: passa dritto (nessun caching speciale)
});