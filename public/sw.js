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

  // iOS ajoute TOUJOURS « from <nom de l'app> » après le titre (confirmé en
  // test réel — impossible à retirer, c'est Apple). Pour que le nom du commerce
  // n'apparaisse qu'UNE seule fois (via ce « from »), on met le MESSAGE en titre
  // et pas de corps : « <message> » puis « from <commerce> ». C'est le plus
  // propre possible sur iPhone.
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
