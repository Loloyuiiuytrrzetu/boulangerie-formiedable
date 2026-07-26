// Service Worker Walletiz — reçoit les notifications push et les affiche
// avec le logo du commerce comme icône.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Gestionnaire `fetch` — INDISPENSABLE pour l'installabilité PWA sur Android.
// Sans lui, Chrome/Samsung Internet n'installe qu'un RACCOURCI (qui rouvre le
// site avec la barre d'URL) au lieu d'une vraie app plein écran (WebAPK), et
// l'invite native « Installer l'application » ne se déclenche pas.
// On laisse le réseau gérer normalement (pas de cache) : on veut juste que le
// service worker « contrôle » la navigation pour être reconnu comme une app.
self.addEventListener("fetch", (event) => {
  // Uniquement les navigations ; le reste suit le comportement par défaut.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(function () {
        return new Response(
          "<!doctype html><meta charset='utf-8'><body style='font-family:sans-serif;padding:2rem;text-align:center'><h1>Hors ligne</h1><p>Vérifiez votre connexion internet puis réessayez.</p></body>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      })
    );
  }
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
  // Logo du commerce en icône (petite pastille) + badge. On n'utilise PAS
  // `image` : sur Android/Samsung ça affichait une grande bannière redondante
  // qui alourdissait la notification. Rendu épuré : logo + nom + message.
  if (data.icon) {
    options.icon = data.icon;
    options.badge = data.icon;
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
