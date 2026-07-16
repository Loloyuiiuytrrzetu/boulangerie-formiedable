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

  // Sur iOS, le système ajoute une ligne « from <nom de l'app> » dès que le
  // titre de la notification DIFFÈRE du nom de l'app installée (PWA). Un titre
  // vide compte comme différent → iOS affichait « Boulangerie Patire » +
  // « from Boulangerie Patire ». La solution : utiliser comme titre le nom du
  // commerce, qui est EXACTEMENT le nom de l'app (manifest.webmanifest
  // dynamique). Titre == nom de l'app → iOS n'ajoute plus aucune ligne « from ».
  const titre = data.titre || "";
  const options = {
    body: data.message || "",
    data: { url: data.url || "/" },
  };
  if (data.icon) {
    options.icon = data.icon;
    options.badge = data.icon;
    options.image = data.icon;
  }

  event.waitUntil(self.registration.showNotification(titre, options));
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
