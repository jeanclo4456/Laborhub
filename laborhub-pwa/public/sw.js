// Service worker mínimo: su sola presencia + el manifest.json es lo que permite
// que Chrome (Android) y Safari (iPhone) ofrezcan "instalar" esta app.
// No cachea nada todavía; se puede ampliar más adelante para uso sin conexión.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Passthrough: deja que cada solicitud vaya a la red normalmente.
});
