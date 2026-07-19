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

  // Le rendu optimal diffère selon le téléphone :
  //  - iPhone (iOS) ajoute TOUJOURS « from <nom de l'app> ». Pour ne pas
  //    afficher le nom deux fois, on masque le titre avec un caractère
  //    invisible (espace de largeur nulle) : il reste « from <commerce> » +
  //    le message en corps.
  //  - Android / ordinateur n'ajoutent PAS de « from » : on met le nom du
  //    commerce en titre (gras) + le message en corps. Propre, nom une fois.
  const ua = (self.navigator && self.navigator.userAgent) || "";
  const estIOS = /iPad|iPhone|iPod/.test(ua);
  const titre = estIOS ? "​" : (data.titre || "");
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
