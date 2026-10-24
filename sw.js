// Service Worker: Offline-Betrieb. Neue Spiele-Dateien unten in FILES eintragen.
const V = 'mg-v7';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest',
  'higher-lower.js', 'time-guess.js', 'blitz-tippen.js', 'kopfrechnen.js', 'farbe-wort.js', 'memory.js', 'zahlenfolge.js', 'schiebepuzzle.js', 'binaer.js', 'gatter.js', 'programm.js', 'safe.js', 'roehren.js', 'lightsout.js', 'karten.jpg', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Aus dem Cache liefern, im Hintergrund aktualisieren
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
