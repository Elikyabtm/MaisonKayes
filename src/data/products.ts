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
      { src: "/images/chapka-verte-produit.webp", width: 1254, height: 1254, kind: "produit", alt: "Chapka à imprimé camouflage vert avec doublure blanche duveteuse et breloque dorée, posée sur une pierre" },
      { src: "/images/chapka-verte-portee-face.webp", width: 1151, height: 1367, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka camouflage verte, vue de face" },
      { src: "/images/chapka-verte-portee-profil.webp", width: 1092, height: 1441, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka camouflage verte, vue de profil" },
      { src: "/images/chapka-verte-detail-breloque.webp", width: 964, height: 1632, kind: "detail", position: "50% 55%", alt: "Gros plan sur la breloque dorée en forme de fleur et de feuilles, posée sur la doublure blanche" },
      { src: "/images/chapka-verte-detail-lien.webp", width: 893, height: 1760, kind: "detail", position: "50% 50%", alt: "Gros plan sur le lien de serrage à imprimé camouflage" },
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
      { src: "/images/chapka-bleue-produit.webp", width: 1254, height: 1254, kind: "produit", alt: "Chapka bleu roi à motifs géométriques dorés avec doublure blanche duveteuse et breloque dorée, posée sur une pierre" },
      { src: "/images/chapka-bleue-portee-face.webp", width: 1179, height: 1334, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka bleu roi à motifs dorés, vue de face" },
      { src: "/images/chapka-bleue-portee-profil.webp", width: 1082, height: 1454, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka bleu roi à motifs dorés, vue de profil" },
      { src: "/images/chapka-bleue-detail-breloque.webp", width: 1049, height: 1499, kind: "detail", position: "50% 60%", alt: "Gros plan sur la breloque dorée posée sur la doublure blanche, tissu bleu à motifs dorés en arrière-plan" },
      { src: "/images/chapka-bleue-detail-lien.webp", width: 941, height: 1672, kind: "detail", position: "50% 45%", alt: "Gros plan sur le lien bleu bordé de tissu imprimé jaune et noir, posé sur une pierre ocre" },
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
      { src: "/images/lingettes-textiles-produit.webp", width: 1188, height: 1324, kind: "produit", alt: "Deux lingettes textiles carrées posées sur une pierre : face imprimée jaune, fuchsia et noir, face éponge turquoise" },
      { src: "/images/lingettes-textiles-plateau.webp", width: 1197, height: 1314, kind: "scene", position: "50% 55%", alt: "Lingettes textiles présentées dans un plateau en bois" },
      { src: "/images/lingettes-textiles-detail.webp", width: 827, height: 1800, kind: "detail", position: "50% 50%", alt: "Pile de lingettes sur un panier en rotin, détail du tissu imprimé et de l’éponge turquoise" },
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
      "Une robe ample à manches courtes, sur fond noir parcouru de lignes jaunes et de pois rouges. L’ourlet est souligné d’une bordure rouge.",
    images: [
      { src: "/images/robe-geometrique-produit.webp", width: 1051, height: 1497, kind: "produit", alt: "Robe noire à motifs géométriques jaunes et pois rouges, ourlet bordé de rouge, sur un cintre" },
      { src: "/images/robe-geometrique-portee.webp", width: 1024, height: 1536, kind: "portee", position: "50% 30%", alt: "Mannequin portant la robe à motifs géométriques contre un mur ocre" },
    ],
    price: null,
    features: [
      "Coupe ample, manches courtes",
      "Fond noir, lignes jaunes et pois rouges",
      "Ourlet souligné d’une bordure rouge",
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
