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

  // iOS/Safari ajoute AUTOMATIQUEMENT « from <nom de l'app> » à toute
  // notification d'app web installée (comportement Apple, non supprimable).
  // Si on met AUSSI le nom du commerce en titre, il apparaît deux fois
  // (« Boulangerie Patire » + « from Boulangerie Patire »).
  // Solution : mettre le MESSAGE en titre. Le nom du commerce n'apparaît
  // alors qu'une seule fois, via la mention « from » ajoutée par iOS, et le
  // message est le texte principal (en gras).
  const titre = data.message || data.titre || "";
  const options = {
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
