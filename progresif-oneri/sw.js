// Kepekci Optik - Service Worker (Offline Destek)
var CACHE_NAME = "kepekci-optik-v7";
var OFFLINE_URLS = [
  "./index.html",
  "./css/style.css",
  "./js/i18n.js",
  "./js/data.js",
  "./js/engine.js",
  "./js/app.js",
  "./js/utils.js",
  "./js/musteri.js",
  "./js/sorun.js",
  "./js/istatistik.js",
  "./js/musteri-ui.js",
  "./foto-olcum.html",
  "./js/foto-olcum.js",
  "./kamera-olcum.html",
  "./js/kamera-olcum.js",
  "./hasta-talimati.html",
  "./olcek-karti.html",
  "./olcum-rehberi.html",
  "./recete.html",
  "./js/recete.js",
  "./sgk-kurulum.html"
];

// Kurulum - dosyalari onbellege al
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Aktivasyon - eski cache'leri temizle
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - once cache, sonra network (offline-first)
self.addEventListener("fetch", function(event) {
  // Sadece GET istekleri
  if (event.request.method !== "GET") return;

  // CDN istekleri icin network-first
  if (event.request.url.indexOf("cdn.jsdelivr.net") !== -1) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Yerel dosyalar icin cache-first
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(function() {
      // Offline ve cache'te yok - HTML istegiyse ana sayfayi goster
      if (event.request.headers.get("accept").indexOf("text/html") !== -1) {
        return caches.match("./index.html");
      }
    })
  );
});
