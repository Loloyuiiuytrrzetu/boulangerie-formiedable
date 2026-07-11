# Fidélio — Carte de fidélité digitale

Application web de carte de fidélité pour petits commerces (restaurants, cafés,
boulangeries…). **Aucune application mobile à installer** : le client scanne un
QR code et gère sa carte depuis son navigateur.

- **Stack** : Next.js (App Router) + TypeScript · Supabase (base + auth) · Tailwind CSS · Vercel
- **Design** : rouge bordeaux (`#7A1E2E`) sur fond blanc

## Les trois espaces

| Espace | URL | Accès |
|---|---|---|
| Page client | `/c/[slug]` | Public, via QR code |
| Dashboard restaurateur | `/dashboard` | Email + mot de passe |
| Super admin | `/super-admin` | Compte avec rôle `super_admin` |

### Côté client (`/c/[slug]`)
- Première visite : saisie du numéro de téléphone → création de la carte, cookie
  httpOnly posé pour la reconnaissance automatique.
- Proposition d'activer les notifications (optionnel, jamais bloquant).
- Visites suivantes : reconnu automatiquement, **1 tampon maximum par jour**
  (vérifié en base, heure de Paris).
- Carte pleine → bouton « Réclamer ma récompense » → remise à zéro, le cycle
  recommence.

### Côté restaurateur (`/dashboard`)
Configuration : nom, logo/photo, couleur de la page, icône du tampon (liste
prédéfinie), nombre de tampons requis, texte de la récompense. Statistiques
(clients, tampons) et **QR code téléchargeable** à imprimer.

### Côté super admin (`/super-admin`)
Liste de tous les restaurants (clients, tampons distribués, date d'inscription),
création / désactivation / suppression de comptes restaurateurs, réinitialisation
de mot de passe, vue support en lecture seule de chaque configuration.

## Installation

### 1. Supabase
1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez **SQL Editor** et exécutez l'intégralité de [`supabase/schema.sql`](supabase/schema.sql)
   (tables, RLS, trigger de profil, bucket de logos).
3. Créez votre compte super admin :
   - **Authentication > Users > Add user** (cochez *Auto Confirm User*) ;
   - puis dans le SQL Editor :
     ```sql
     update public.profiles set role = 'super_admin'
     where id = (select id from auth.users where email = 'VOTRE_EMAIL');
     ```

### 2. Variables d'environnement
```bash
cp .env.example .env.local
```
Renseignez (Dashboard Supabase > Settings > API) :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(secrète — jamais exposée au navigateur)*
- `NEXT_PUBLIC_SITE_URL` (URL du site, utilisée pour générer les QR codes)

**Notifications push (optionnel)** — pour envoyer de vraies notifications :
```bash
npx web-push generate-vapid-keys
```
Ajoutez ensuite :
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (clé publique VAPID)
- `VAPID_PRIVATE_KEY` (clé privée VAPID, secrète)
- `VAPID_SUBJECT` (par ex. `mailto:contact@votredomaine.com`)
- `CRON_SECRET` (recommandé — protège l'endpoint `/api/cron/notifications` ; Vercel envoie ce token dans l'en-tête `Authorization: Bearer`)

Le cron Vercel défini dans `vercel.json` (`* * * * *`) exécute automatiquement
les notifications programmées à leur date/heure locale du commerce.

### 3. Lancement
```bash
npm install
npm run dev
```

### 4. Déploiement Vercel
Importez le dépôt sur [vercel.com](https://vercel.com), ajoutez les 4 variables
d'environnement ci-dessus (avec `NEXT_PUBLIC_SITE_URL` = votre domaine de prod),
déployez.

## Sécurité (résumé)

- **RLS activé sur toutes les tables.** Un restaurateur ne voit que ses données
  (`owner_id = auth.uid()`) ; la fonction SQL `is_super_admin()` ouvre l'accès
  complet au rôle `super_admin`.
- Les clients finaux ne sont **pas authentifiés** : toutes leurs opérations
  (inscription, tampon, récompense) passent par des Server Actions Next.js qui
  utilisent la clé `service_role` côté serveur, avec un token opaque en cookie
  httpOnly. La clé n'atteint jamais le navigateur.
- Chaque action super admin revérifie le rôle côté serveur avant d'utiliser la
  clé `service_role`.
- Anti-abus tampons : la contrainte « 1 par jour » est revérifiée en base au
  moment de l'UPDATE (protège contre double clic / onglets multiples).

## Limites connues / pistes d'évolution

- Le numéro de téléphone n'est pas vérifié par SMS (à ajouter avec Twilio/Vonage
  si besoin).
