# Maison Kayes — site vitrine

Site de la marque Afro Fusion **Maison Kayes**, fondée par Fatoumata Gassama.
Le site présente la marque et ses créations ; les achats se font sur Etsy (pas de panier, de paiement ni de compte client).

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
| `src/data/site.ts` | Logo, lien de la boutique Etsy, e-mail, téléphone, ville, réseaux sociaux, crédit |
| `src/data/products.ts` | Catalogue : noms, catégories, descriptions, images, prix, caractéristiques, liens Etsy |
| `src/data/content.ts` | Texte « À propos » (parcours, histoire du nom, inspirations), étapes et projets d’upcycling |
| `src/app/mentions-legales`, `src/app/confidentialite` | Pages légales à compléter |

Toute valeur laissée à `null` (ou tableau vide) est masquée : aucun faux lien n’est affiché.

- **Lien Etsy d’un produit** : renseigner `etsyUrl`. Sinon, la fiche invite à contacter la marque.
- **Boutique Etsy** : renseigner `etsyShopUrl`. Sinon, le bouton « Boutique Etsy (bientôt) » mène à la page Contact.
- **Filtre Upcycling** : il apparaît automatiquement dès qu’un produit a `upcycled: true`.
- **Projets de transformation** : ajouter des entrées à `transformationProjects` ; la section apparaît sur la page Upcycling.
- **Logo** : déposer le fichier dans `public/images/` et renseigner `logoSrc`.

## Images

Les images optimisées (WebP, noms explicites) sont dans `public/images/`. Le cadrage se règle image par image
avec le champ `position` (`object-position` CSS) dans `products.ts`.
Les découpes du ZIP (≈ 160 à 360 px de large) sont affichées dans de petits formats, sans recadrage, et ne sont jamais agrandies au-delà de 2×.
