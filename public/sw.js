// Service Worker Walletiz — reçoit les notifications push et les affiche
// avec le logo du commerce comme icône.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { titre: "Notification", message: event.data ? event.data.text() : "" };
  }

  // Sur iOS, si le titre est différent du nom de l'app installée (PWA),
  // le système ajoute une ligne "from <nom de l'app>". Pour éviter ce
  // doublon disgracieux (« COCO hit » + « from COCO hit »), on omet le
  // titre : iOS utilise alors directement le nom de l'app (= le nom du
  // commerce, grâce au manifest.webmanifest dynamique) comme titre.
  const options = {
    body: data.message || "",
    data: { url: data.url || "/" },
  };
  if (data.icon) {
    options.icon = data.icon;
    options.badge = data.icon;
    options.image = data.icon;
  }

  event.waitUntil(self.registration.showNotification("", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const cible = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const c of clientsArr) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(cible);
    })
  );
});
