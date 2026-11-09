# Maison Kayes — site vitrine

Site de la marque Afro Fusion **Maison Kayes**, fondée par Fatoumata Gassama.
Le site présente la marque et vend ses créations en direct : paiement par Stripe Checkout (carte, Bancontact, Apple Pay, Google Pay selon les moyens activés dans Stripe), sans compte client.

Stack : Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Postgres (Drizzle ORM). Polices auto-hébergées : Anton (titres) et Archivo (texte).

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # version de production
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

Variable d’environnement facultative : `NEXT_PUBLIC_SITE_URL` (URL publique, pour les métadonnées et le sitemap).

## Où modifier le contenu

| Où | Contenu |
| --- | --- |
| Dashboard `/admin` | Fiches produit, prix, variantes, photos, visibilité, stocks, commandes |
| `src/data/site.ts` | Logo, e-mail (contact@maisonkayes.be), Instagram (@maisonkayes), téléphone, ville, crédit |
| `src/data/categories.ts` | Catégories du catalogue et anciens liens redirigés |
| `src/data/shipping.ts` | Zones de livraison (pays acceptés par zone) |
| `src/data/content.ts` | Texte « À propos » (parcours, histoire du nom, inspirations), étapes et projets d’upcycling |
| `src/app/(site)/conditions-generales-de-vente`, `mentions-legales`, `confidentialite` | Pages légales à compléter |

## Base de données et premier administrateur

- **Production** : définir `DATABASE_URL` (Postgres : Neon, Supabase, Vercel Postgres…).
- **Développement** : sans `DATABASE_URL`, une base PGlite (Postgres embarqué) est créée dans `.data/pglite`.

Au premier accès, les migrations (`drizzle/`) s’appliquent et le catalogue de départ (`src/db/seed-data.ts`)
est importé si la base est vide. Ensuite, **les fiches se gèrent depuis le dashboard**.

Créer un administrateur (aucune inscription publique) — avec `DATABASE_URL` pointant vers la base voulue :

```bash
npm run admin -- create contact@maisonkayes.be --name "Fatoumata Gassama"   # mot de passe demandé (12 caractères min.)
npm run admin -- password <email>     # changer le mot de passe (ferme les sessions ouvertes)
npm run admin -- disable <email>      # retirer l’accès   |   enable <email>
npm run admin -- list
```

En local avec PGlite, arrêter `npm run dev` avant de lancer ces commandes.
Après une modification de `src/db/schema.ts` : `npm run db:generate` crée la migration SQL correspondante.

## Comptes clients (`/compte`)

Facultatifs : on peut toujours commander sans compte. Lien « Mon compte » dans l’en-tête.

- **Inscription / connexion** (`/compte/inscription`, `/compte/connexion`), mot de passe de 10 caractères minimum,
  tentatives limitées. Session de 30 jours dans un cookie `mk_client`, distinct de celui des administrateurs :
  un compte client n’ouvre jamais le dashboard.
- **Confirmation de l’adresse e-mail** (lien valable 48 h, envoyé via Resend). Les commandes passées sans compte avec
  cette adresse ne sont rattachées qu’**après** confirmation : personne ne peut voir les commandes d’un autre en
  créant un compte à son adresse.
- **Mes commandes** : statut (en préparation, expédiée, livrée, annulée), articles, total payé, lien de suivi.
- **Adresse enregistrée** : pré-remplie sur la page de paiement Stripe (via un client Stripe), et enregistrée
  automatiquement après la première commande.
- **Mot de passe oublié** : lien valable 1 h, à usage unique ; même réponse que l’adresse ait un compte ou non.
- **Newsletter** : case non cochée par défaut, date du consentement conservée, désinscription depuis le compte.
  Export CSV des inscrits dans le dashboard (`/admin/clients`).
- **Suppression du compte** par le client ; les commandes sont conservées sans lien avec un compte.

## Mise en ligne et accès au dashboard

Le dashboard est sur `https://<domaine>/admin` (en local : `http://localhost:3000/admin`). Pour le mettre en ligne :

1. Déployer le dépôt chez un hébergeur Next.js (Vercel recommandé) et y relier le domaine.
2. Créer une base Postgres (Neon, Supabase ou Vercel Postgres) et renseigner `DATABASE_URL`.
3. Renseigner les autres variables de `.env.example` (Stripe, Resend, `NEXT_PUBLIC_SITE_URL`).
4. Depuis un ordinateur où se trouve le projet, avec `DATABASE_URL` pointant vers la base en ligne :
   `npm run admin -- create contact@maisonkayes.be --name "Fatoumata Gassama"`.
5. Se connecter sur `https://<domaine>/admin` (ordinateur ou téléphone) et ajouter la page aux favoris :
   il n’y a volontairement aucun lien vers le dashboard sur le site public.

## Dashboard `/admin`

Accès réservé aux comptes administrateurs actifs : la session (cookie `httpOnly`, 7 jours, stockée en base)
est vérifiée côté serveur sur chaque page et chaque action. Connexion limitée à 5 échecs par e-mail
et 20 par adresse IP sur 15 minutes.

- **Vue d’ensemble** : commandes à préparer, en attente de paiement, expédiées, remises ; stocks bas, ruptures, stocks à renseigner.
- **Commandes** : recherche (référence, client, e-mail, suivi, article), filtres par statut de préparation et de paiement,
  détail (articles et variantes, totaux, client, adresse de livraison recueillie par Stripe), statut
  « À préparer / Expédiée / Remise », transporteur, numéro de suivi, note, annulation avec remise en stock.
  Le statut de paiement (payé, en attente, échoué, remboursé) se met à jour automatiquement via Stripe.
- **Stocks** : quantité par variante, ajout / retrait / inventaire avec motif et note, seuil d’alerte, historique des mouvements.
  Une quantité inconnue s’affiche « Stock à renseigner » : la pièce ne peut pas être commandée tant qu’elle n’est pas renseignée.
- **Clients** : comptes clients, confirmation de l’e-mail, nombre de commandes, inscrits à la newsletter (export CSV).
- **Catalogue** : nom, catégorie, description, caractéristiques, prix, visibilité, ordre des fiches (les cinq premières
  fiches visibles forment la sélection de l’accueil), variantes, photos (import, texte alternatif, ordre, suppression).
  L’adresse d’une fiche (`/creations/<slug>`) ne change jamais.

## E-mails de commande (Resend)

Le site envoie ses propres e-mails ; **Stripe envoie les reçus de paiement et de remboursement**
(Stripe → Paramètres → E-mails clients : activer « Paiements réussis » et « Remboursements »).

| E-mail | Déclencheur | Destinataire |
| --- | --- | --- |
| Confirmation de commande (référence, articles, variantes, quantités, total payé, livraison) | Paiement confirmé par Stripe et commande enregistrée (webhook) | Client |
| « Nouvelle commande à préparer » | Même moment | `ORDER_NOTIFICATION_EMAIL` |
| Avis d’expédition (référence, transporteur, numéro et lien de suivi) | Premier passage au statut « Expédiée » dans le dashboard | Client |

- **Pas de doublon** : chaque e-mail est réservé en base (une ligne par commande et par type) avant l’envoi.
  Une notification Stripe rejouée ou un statut « Expédiée » enregistré plusieurs fois n’envoie rien de plus.
  Resend reçoit en plus une clé d’idempotence.
- **Échec d’envoi** : la commande reste payée et à préparer. L’erreur s’affiche dans la commande (rubrique « E-mails »),
  dans la vue d’ensemble et via le filtre « E-mail en échec » ; le bouton « Relancer cet e-mail » ne renvoie que celui-là.
- **Réglages** : `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `ORDER_NOTIFICATION_EMAIL` (voir `.env.example`).
  Tant qu’ils manquent, les envois sont marqués en échec avec le motif « non configuré ».

## Catégories

Vêtements · Couvre-chefs · Accessoires (`src/data/categories.ts`). L’ancien lien `/creations?categorie=lingettes`
redirige vers les Accessoires.

## Boutique (Stripe)

Un seul parcours de paiement : le bouton « Commander » de la fiche envoie la pièce, la variante et la zone
de livraison à `/api/checkout`, qui vérifie prix et stock **en base** puis ouvre Stripe Checkout.
Aucun produit n’est à créer dans Stripe : le prix est transmis à chaque commande.

1. Créer le compte Stripe et activer les moyens de paiement (cartes, Bancontact, Apple Pay, Google Pay…).
2. Créer les **tarifs de livraison** (Produits → Tarifs de livraison) et renseigner leurs `shr_…` (voir `.env.example`).
3. Créer le **webhook** vers `https://<domaine>/api/stripe/webhook` avec les quatre événements listés dans `.env.example`.
4. Activer les reçus Stripe (Paramètres → E-mails clients → Paiements réussis et Remboursements).
5. Dans le dashboard : renseigner le prix et le stock de chaque pièce.
6. Tester en mode test (`sk_test_…`, carte `4242 4242 4242 4242`), puis passer aux clés `sk_live_…`.

Après paiement, le webhook enregistre la commande et retire le stock (mouvement « Vente en ligne »).
Si deux clients paient la dernière pièce au même moment, la seconde commande est annulée et remboursée automatiquement.
Une pièce est commandable si elle est visible, a un prix et au moins une variante en stock ; sinon la fiche invite
à contacter la marque.

## Images

Les images d’origine (WebP, noms explicites) sont dans `public/images/` ; les photos importées depuis le dashboard
sont stockées en base et servies sous `/media/<id>.webp`.
Les fichiers sources (jusqu’à 1 800 px) sont déclinés automatiquement par `next/image` en variantes adaptées à chaque écran
(AVIF/WebP, `srcset`), avec chargement différé hors du premier écran et visuel d’accueil préchargé.
Les images de la veste en denim (page Upcycling) sont des images générées, présentées comme exemple illustratif.
