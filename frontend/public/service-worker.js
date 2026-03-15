const CACHE_NAME = "modulift-client-v1"; //Nome della cache salvata nel browser

const URLS_TO_CACHE = [ //Lista delle risorse precaricate, essendo SPA basta index
    "/",
    "/index.html",
    "/manifest.json"
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

// ACTIVATE con gestione del cache versioning
self.addEventListener("activate", (event) => {
    console.log("[SW] Activate");
    event.waitUntil( //caches.keys() restituisce un array con tutti i nomi delle cache salvate nel browser
        caches.keys().then((keys) =>
            Promise.all( //Promise.all(...) per eseguire più operazioni asincrone contemporaneamente e aspettare che tutte finiscano
                keys
                    .filter((key) => key !== CACHE_NAME) //Filtro solo le cache vecchie
                    .map((key) => {
                        console.log("[SW] Removing old cache:", key);
                        return caches.delete(key); //Cancello vecchie cache
                    })
            )
        )
    );
    self.clients.claim(); //il service worker appena attivato prende subito il controllo di tutte le pagine aperte
});

// FETCH
self.addEventListener("fetch", (event) => {
    const request = event.request; //Estrazione richieste
    const url = new URL(request.url); //Estrazione url richiesta

    // 1) ignora TUTTO ciò che non è http/https (es. chrome-extension://)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return;
    }

    // 2) ignora le API backend (lasciamo a fetch/axios)
    if (url.pathname.startsWith("/api/")) {
        return;
    }

    // 3) Navigazione SPA → network first con fallback a index.html
    //    (vale per TUTTE le route: /cliente/..., /admin/..., ecc.)
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => {
                console.log("[SW] Offline, serve index.html dalla cache");
                return caches.match("/index.html");     //Provo in rete -> se offline -> uso index.html dalla cache
            })
        );
        return;
    }

    // 4) Asset statici SAME-ORIGIN (JS, CSS, immagini, font) → cache first
    if (
        (
            url.origin === self.location.origin ||
            url.pathname.startsWith("/uploads/") //Per le immagini
        ) &&
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
                    return cachedResponse; //Se il file richiesto è già presente in cache lo carico subito
                }

                return fetch(request)
                    .then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            // qui ora sono sicuro che è http/https e same-origin
                            cache.put(request, networkResponse.clone()); //Metto in cache una copia della risposta alla richiesta
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