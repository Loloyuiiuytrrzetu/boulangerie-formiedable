# CONTEXTE POUR CLAUDE — Projet Walletiz

Colle ce fichier au début de ta nouvelle conversation avec Claude Code pour qu'il reprenne exactement où on s'est arrêté.

---

## Qui je suis
- Utilisateur : **Ursule Samuel** (ursulesamuel267@gmail.com)
- Situé en **Guadeloupe** (fuseau UTC-4)
- Je crée **Walletiz**, une SaaS de cartes de fidélité digitales pour petits commerces (boulangeries, restaurants, cafés)
- Aesthétique : **bordeaux (#7A1E2E)** sur blanc, entièrement en français

## Stack technique
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **Supabase** (auth + Postgres + storage) — RLS activé partout
- **Vercel** pour l'hébergement, plan **Hobby**
- **GitHub** : repo `Loloyuiiuytrrzetu/boulangerie-formiedable` (branche `main`)
- **Domaine** : https://walletiz.fr (chez Hostinger)

## Les 3 espaces du site
| Espace | URL | Accès |
|---|---|---|
| Client (fidélité) | `/c/[slug]` | Public, via QR code |
| Restaurateur | `/dashboard` | Login email/password |
| Super admin | `/super-admin` | Rôle `super_admin` — c'est moi |

## Fonctionnalités déjà en place
- Sidebar bordeaux pleine hauteur côté restaurateur
- Cartes de fidélité multiples par commerce, avec 4 formes de tampons (carré, cercle, hexagone, étoile), 33 icônes, upload image perso
- Récompenses avec image (choix, pas cumulatif)
- Sections personnalisables côté client
- QR code strict (pas de tampon sans scan récent)
- QR code personnel par client (le restaurateur le scan = auto-fill)
- Sous-compte scanner (1 par commerce)
- Impersonation super admin ("Voir le commerce")
- Timezone par commerce pour calculs de dates exacts
- Graphes semaine + année avec sélecteur d'année
- Animations récompense CSS (étoiles, ondes, rayons, vague)
- Palette de 24 couleurs
- Notifications push (immédiates + programmées avec fuseau du commerce)

## Migrations Supabase déjà exécutées
- `schema.sql` initial
- `migration-2` à `migration-10` (cartes, sections, animations, timezone, forme tampon, etc.)
- **`migration-11-notifications-push.sql`** — tables `push_subscriptions` + `notifications_push` ✅

## Variables d'environnement Vercel configurées
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` = `https://walletiz.fr`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = `BErPlYxwS8py4itSqkIdZOYTlEjrXOdCwE0cWcyPlH69ZTb2zIbep6eyaCuWN_0ptwEgw5eXCTI0eSR86QmvnNU`
- `VAPID_PRIVATE_KEY` = `ZFPBUPCX9Z0bcaIIBQ94kTTK_eFT544KHUNeD-yhuBI`
- `VAPID_SUBJECT` = `mailto:ursulesamuel267@gmail.com`
- `CRON_SECRET` (défini)

## Domaine (DNS Hostinger)
- `A @` → `216.198.79.1` ✅
- `TXT _vercel` → `vc-domain-verify=walletiz.fr,4f183d290ca45aedf434` ✅
- `TXT _vercel` (2ème) → `vc-domain-verify=www.walletiz.fr,a8385a92206c111b4e43` ✅
- `CNAME www` → `walletiz.fr`
- **AAAA supprimé** (celui d'Hostinger qui bloquait)

## PROBLÈME EN COURS (À RÉSOUDRE EN PRIORITÉ)

**Vercel ne déploie plus depuis le commit `dd5fafa` (8h avant le 11 juillet 2026 vers 22h Guadeloupe).**

Depuis, j'ai poussé sur main :
- `d91bc69` — Fond dashboard plus foncé + notifications push
- `2ce4e79` — commit vide de déclenchement
- `bb7ab3c` — Renomme README en Walletiz
- `840db59` — Ajout icon.png (logo)
- `da36eba` — Renomme icon.png (retire espace)
- `b58186d` — Métadonnées Open Graph

**Aucun de ces commits n'a été déployé.** Le site sert encore le code de `dd5fafa`.

### Ce qu'on a vérifié
- GitHub App Vercel : installée, "All repositories" ✅
- Webhooks GitHub classiques : vides (normal, Vercel utilise GitHub App)
- Git connecté sur Vercel Settings → Git ✅
- Deploy Hook créé et déclenché → retourne `{"state":"PENDING"}` mais aucun build n'apparaît
- Disconnect/Reconnect Git tenté sur Vercel → sans effet

### Deploy Hook enregistré (déjà créé)
URL : `https://api.vercel.com/v1/integrations/deploy/prj_qQG73bOu0BTwl3XeCVJTeOJfxHvb/6AvDIQs5wo`
Branch : `main`

### Hypothèse la plus probable
**Limite quotidienne du plan Hobby atteinte (100 déploiements/jour)**. Le compteur se reset à minuit UTC = **20h heure Guadeloupe**.

### Ce qu'il faut faire dans la nouvelle conv
1. Le 12 juillet après 20h Guadeloupe, aller sur Vercel Deployments et vérifier si un déploiement automatique s'est lancé
2. Si oui → le site aura d'un coup : fond plus foncé, onglet notifications push, favicon logo, Open Graph
3. Si non → re-trigger le deploy hook avec `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_qQG73bOu0BTwl3XeCVJTeOJfxHvb/6AvDIQs5wo"`
4. Si ça ne marche toujours pas → explorer autre chose (support Vercel, upgrade Pro, etc.)

## À faire après déblocage Vercel
1. Tester les notifications push (envoi immédiat + programmé) sur mobile
2. Vérifier que le logo apparaît bien dans l'onglet navigateur + partage WhatsApp
3. Continuer à améliorer le site selon mes demandes

## Contexte financier / plan
- Plan Vercel : **Hobby** (gratuit)
- Si limite quotidienne = vrai problème récurrent, envisager Vercel Pro (~$20/mois)

## Branche git de travail (héritée)
`claude/loyalty-card-app-in3kh4` — mais on merge directement sur `main` maintenant

---

**Commence par vérifier l'état du déploiement Vercel et me dire ce que tu vois.**
