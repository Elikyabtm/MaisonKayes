/**
 * Catalogue Maison Kayes — source unique des fiches produit.
 *
 * Règles :
 * - Les noms sont provisoires et descriptifs : les modifier ici suffit.
 * - Ne renseigner `price`, `etsyUrl` et `features` qu’avec des informations confirmées.
 *   Un champ vide ou `null` est masqué sur le site.
 * - `upcycled: true` uniquement si la pièce est confirmée comme upcyclée
 *   (le filtre « Upcycling » apparaît automatiquement dès qu’une pièce l’est).
 */

export type Category = "vetements" | "accessoires" | "lingettes";

export const categories: Record<Category, { label: string; singular: string }> = {
  vetements: { label: "Vêtements", singular: "Vêtement" },
  accessoires: { label: "Accessoires", singular: "Accessoire" },
  lingettes: { label: "Lingettes", singular: "Lingettes textiles" },
};

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Rôle de l’image : photo produit, portée, détail ou mise en scène (image générée). */
  kind: "produit" | "portee" | "detail" | "scene";
  /** Cadrage CSS `object-position`, réglé image par image. */
  position?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  /** Description courte, fondée sur ce qui est visible sur la photo produit. */
  description: string;
  /** Première image = photo produit ; seconde = photo portée si elle existe. */
  images: ProductImage[];
  /** Prix affiché tel quel, ex. « 45 € ». `null` = masqué. */
  price: string | null;
  /** Caractéristiques confirmées uniquement. */
  features: string[];
  /** Lien vers la fiche Etsy. `null` = invitation à contacter la marque. */
  etsyUrl: string | null;
  upcycled: boolean;
};

export const products: Product[] = [
  {
    id: "mk-001",
    slug: "chapka-camouflage-verte",
    name: "Chapka camouflage verte",
    category: "accessoires",
    description:
      "Une chapka à imprimé camouflage vert, kaki et brun, adoucie par une doublure blanche aux poils longs. Une breloque dorée vient signer le rabat frontal.",
    images: [
      { src: "/images/chapka-verte-produit.webp", width: 358, height: 335, kind: "produit", position: "50% 55%", alt: "Chapka à imprimé camouflage vert avec doublure blanche duveteuse et breloque dorée, posée sur une pierre" },
      { src: "/images/chapka-verte-portee-face.webp", width: 282, height: 335, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka camouflage verte, vue de face" },
      { src: "/images/chapka-verte-portee-profil.webp", width: 254, height: 335, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka camouflage verte, vue de profil" },
      { src: "/images/chapka-verte-detail-breloque.webp", width: 198, height: 335, kind: "detail", alt: "Détail de la breloque dorée en forme de fleur et de feuilles sur la doublure blanche" },
      { src: "/images/chapka-verte-detail-lien.webp", width: 170, height: 335, kind: "detail", alt: "Détail du lien de serrage à imprimé camouflage" },
    ],
    price: null,
    features: [
      "Imprimé camouflage vert, kaki et brun",
      "Doublure et rabats blancs à poils longs",
      "Cache-oreilles avec liens",
      "Breloque dorée sur le rabat avant",
    ],
    etsyUrl: null,
    upcycled: false,
  },
  {
    id: "mk-002",
    slug: "chapka-bleu-roi-motifs-dores",
    name: "Chapka bleu roi à motifs dorés",
    category: "accessoires",
    description:
      "Une chapka bleu roi travaillée avec un tissu imprimé de motifs géométriques dorés, associée à une doublure blanche aux poils longs et à une breloque dorée.",
    images: [
      { src: "/images/chapka-bleue-produit.webp", width: 334, height: 320, kind: "produit", position: "50% 55%", alt: "Chapka bleu roi à motifs géométriques dorés avec doublure blanche duveteuse, posée sur une pierre" },
      { src: "/images/chapka-bleue-portee-face.webp", width: 283, height: 320, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka bleu roi, vue de face" },
      { src: "/images/chapka-bleue-portee-profil.webp", width: 238, height: 320, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka bleu roi, vue de profil" },
      { src: "/images/chapka-bleue-detail-breloque.webp", width: 224, height: 320, kind: "detail", alt: "Détail de la breloque dorée et du tissu bleu à motifs dorés" },
      { src: "/images/chapka-bleue-detail-lien.webp", width: 181, height: 320, kind: "detail", alt: "Détail du lien bleu bordé de tissu imprimé" },
    ],
    price: null,
    features: [
      "Tissu bleu roi à motifs géométriques dorés",
      "Doublure et rabats blancs à poils longs",
      "Cache-oreilles avec liens",
      "Breloque dorée sur le rabat avant",
    ],
    etsyUrl: null,
    upcycled: false,
  },
  {
    id: "mk-003",
    slug: "chapka-marbree-doublure-camouflage",
    name: "Chapka marbrée, doublure camouflage",
    category: "accessoires",
    description:
      "Un tissu à effet marbré bleu nuit, brique et blanc rencontre une doublure bouclée à motif camouflage, visible sur le rabat et les cache-oreilles.",
    images: [
      { src: "/images/chapka-marbree-produit.webp", width: 1254, height: 1254, kind: "produit", position: "50% 55%", alt: "Chapka à tissu marbré bleu nuit, brique et blanc, avec doublure bouclée camouflage, sur fond crème" },
      { src: "/images/chapka-marbree-portee.webp", width: 1122, height: 1402, kind: "portee", position: "50% 25%", alt: "Mannequin portant la chapka marbrée à doublure camouflage, lumière dorée" },
    ],
    price: null,
    features: [
      "Tissu à effet marbré bleu nuit, brique et blanc",
      "Doublure bouclée à motif camouflage",
      "Cache-oreilles",
    ],
    etsyUrl: null,
    upcycled: false,
  },
  {
    id: "mk-004",
    slug: "lingettes-textiles",
    name: "Lingettes textiles imprimé & éponge",
    category: "lingettes",
    description:
      "Des carrés textiles qui associent une face en tissu imprimé jaune, fuchsia et noir à une face éponge turquoise. Chaque lingette porte une petite étiquette.",
    images: [
      { src: "/images/lingettes-textiles-produit.webp", width: 322, height: 359, kind: "produit", position: "50% 45%", alt: "Deux lingettes textiles carrées : face imprimée jaune, fuchsia et noir, face éponge turquoise" },
      { src: "/images/lingettes-textiles-plateau.webp", width: 327, height: 359, kind: "scene", position: "50% 55%", alt: "Lingettes textiles présentées dans une coupe en bois" },
      { src: "/images/lingettes-textiles-detail.webp", width: 165, height: 359, kind: "detail", alt: "Pile de lingettes, détail des bords et des tissus" },
    ],
    price: null,
    features: [
      "Format carré",
      "Une face en tissu imprimé jaune, fuchsia et noir",
      "Une face éponge turquoise",
      "Étiquette cousue",
    ],
    etsyUrl: null,
    upcycled: false,
  },
  {
    id: "mk-005",
    slug: "robe-motifs-geometriques",
    name: "Robe à motifs géométriques",
    category: "vetements",
    description:
      "Une robe ample à manches courtes, sur fond noir parcouru de lignes jaunes et de pois rouges. L’ourlet est bordé de petits pompons rouges.",
    images: [
      { src: "/images/robe-geometrique-produit.webp", width: 252, height: 359, kind: "produit", position: "50% 40%", alt: "Robe noire à motifs géométriques jaunes et pois rouges, bordée de pompons rouges, sur un cintre" },
      { src: "/images/robe-geometrique-portee.webp", width: 240, height: 359, kind: "portee", position: "50% 30%", alt: "Mannequin portant la robe à motifs géométriques contre un mur ocre" },
      { src: "/images/robe-geometrique-mise-en-scene.webp", width: 1672, height: 941, kind: "scene", position: "82% 50%", alt: "Mannequin en robe à motifs géométriques dans une cour baignée de lumière ocre" },
    ],
    price: null,
    features: [
      "Coupe ample, manches courtes",
      "Fond noir, lignes jaunes et pois rouges",
      "Ourlet bordé de pompons rouges",
    ],
    etsyUrl: null,
    upcycled: false,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const hasUpcycledProducts = () => products.some((p) => p.upcycled);

/** Ordre de la sélection de la page d’accueil. */
export const homeSelection = [
  "chapka-camouflage-verte",
  "chapka-bleu-roi-motifs-dores",
  "chapka-marbree-doublure-camouflage",
  "lingettes-textiles",
  "robe-motifs-geometriques",
];
