// Uygulama dosyalarını telefonda saklar; internet yokken de açılır.
// Uygulamayı güncellediğimizde VERSION değişir, telefon yeni sürümü indirir.
const VERSION = 'rdt-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'xlsx.full.min.js', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce internetten dene (en yeni sürüm), olmazsa telefondaki kopyayı aç.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
