# Maison Kayes — site vitrine

Site de la marque Afro Fusion **Maison Kayes**, fondée par Fatoumata Gassama.
Le site présente la marque et vend ses créations en direct : paiement par Stripe Checkout (carte, Bancontact, Apple Pay, Google Pay selon les moyens activés dans Stripe), sans compte client.

Stack : Next.js 16 (App Router), TypeScript, Tailwind CSS 4. Polices auto-hébergées : Anton (titres) et Archivo (texte).

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

| Fichier | Contenu |
| --- | --- |
| `src/data/site.ts` | Logo, e-mail (contact@maisonkayes.be), Instagram (@maisonkayes), téléphone, ville, crédit |
| `src/data/products.ts` | Catalogue : noms, catégories, descriptions, images, caractéristiques, identifiant du produit Stripe |
| `src/data/shipping.ts` | Zones de livraison (pays acceptés par zone) |
| `src/data/content.ts` | Texte « À propos » (parcours, histoire du nom, inspirations), étapes et projets d’upcycling |
| `src/app/conditions-generales-de-vente`, `src/app/mentions-legales`, `src/app/confidentialite` | Pages légales à compléter |

Toute valeur laissée à `null` (ou tableau vide) est masquée : aucun faux lien n’est affiché.

- **Filtre Upcycling** : il apparaît automatiquement dès qu’un produit a `upcycled: true`.
- **Projets de transformation** : ajouter des entrées à `transformationProjects` ; la section apparaît sur la page Upcycling.
- **Logo** : `public/images/logo-maison-kayes.webp` (fond transparent, texte noir : toujours sur fond clair).
- **Favicon** : `src/app/favicon.ico`, `src/app/icon.png` et `src/app/apple-icon.png` (conventions Next.js, balises générées automatiquement).

## Boutique (Stripe)

Le prix et le stock de chaque pièce se gèrent **dans le tableau de bord Stripe**, pas dans le code.

1. **Créer le compte Stripe** au nom de l’activité et activer les moyens de paiement souhaités
   (Paramètres → Moyens de paiement : cartes, Bancontact, Apple Pay, Google Pay…).
2. **Créer chaque pièce** dans Produits : nom, photo, **prix par défaut** en EUR.
   - Pièce unique : ajouter la métadonnée `stock` = `1`.
   - Pièce en série : `stock` = quantité disponible.
   - Sans métadonnée `stock` : stock non suivi (commande toujours possible, 10 max par commande).
3. **Relier la pièce au site** : copier son identifiant `prod_…` dans `stripeProductId` (`src/data/products.ts`).
4. **Créer les tarifs de livraison** (Produits → Tarifs de livraison) et renseigner leurs `shr_…` dans les variables d’environnement.
5. **Créer le webhook** vers `https://<domaine>/api/stripe/webhook` et renseigner son secret.
6. **Activer les reçus par e-mail** (Paramètres → E-mails clients → Paiements réussis) et les notifications de nouvelles commandes.
7. Renseigner les variables d’`.env.example` chez l’hébergeur, puis tester en mode test (`sk_test_…`, carte `4242 4242 4242 4242`).

Fonctionnement :
- La fiche affiche le prix, le stock (« Pièce unique », « Plus que 3 en stock ») et les zones de livraison avec leur tarif.
- « Commander » crée une session Stripe Checkout (adresse limitée aux pays de la zone choisie) ; le paiement se fait sur la page Stripe.
- Après paiement, le webhook décrémente le stock ; une pièce à 0 s’affiche « Vendu ». Si deux clients paient la dernière pièce
  au même moment, le second paiement est remboursé automatiquement.
- Prix et stock sont relus dans Stripe au plus toutes les 60 secondes, et immédiatement après une vente.
- Tant que Stripe n’est pas configuré, ou qu’une pièce n’est pas reliée, la fiche invite à contacter la marque.

## Images

Les images optimisées (WebP, noms explicites) sont dans `public/images/`. Le cadrage se règle image par image
avec le champ `position` (`object-position` CSS) dans `products.ts`.
Les fichiers sources (jusqu’à 1 800 px) sont déclinés automatiquement par `next/image` en variantes adaptées à chaque écran
(AVIF/WebP, `srcset`), avec chargement différé hors du premier écran et visuel d’accueil préchargé.
Les images de la veste en denim (page Upcycling) sont des images générées, présentées comme exemple illustratif.
