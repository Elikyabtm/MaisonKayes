/**
 * Catalogue de départ, importé une seule fois dans la base de données quand elle est vide.
 * Ensuite, les fiches se gèrent depuis le dashboard /admin : modifier ce fichier n’a plus d’effet.
 */
import type { Category } from "@/data/categories";

export type SeedImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: "produit" | "portee" | "detail" | "scene";
  position?: string;
};

export type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  images: SeedImage[];
  features: string[];
  /** Déclinaisons ; sans cette liste, une seule variante « Unique ». */
  variants?: string[];
  upcycled: boolean;
};

export const seedProducts: SeedProduct[] = [
  {
    id: "mk-001",
    slug: "chapka-camouflage-verte",
    name: "Chapka camouflage verte",
    category: "couvre-chefs",
    description:
      "Une chapka à imprimé camouflage vert, kaki et brun, adoucie par une doublure blanche aux poils longs. Une breloque dorée vient signer le rabat frontal.",
    images: [
      { src: "/images/chapka-verte-produit.webp", width: 1254, height: 1254, kind: "produit", alt: "Chapka à imprimé camouflage vert avec doublure blanche duveteuse et breloque dorée, posée sur une pierre" },
      { src: "/images/chapka-verte-portee-face.webp", width: 1151, height: 1367, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka camouflage verte, vue de face" },
      { src: "/images/chapka-verte-portee-profil.webp", width: 1092, height: 1441, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka camouflage verte, vue de profil" },
      { src: "/images/chapka-verte-detail-breloque.webp", width: 964, height: 1632, kind: "detail", position: "50% 55%", alt: "Gros plan sur la breloque dorée en forme de fleur et de feuilles, posée sur la doublure blanche" },
      { src: "/images/chapka-verte-detail-lien.webp", width: 893, height: 1760, kind: "detail", position: "50% 50%", alt: "Gros plan sur le lien de serrage à imprimé camouflage" },
    ],
    features: [
      "Imprimé camouflage vert, kaki et brun",
      "Doublure et rabats blancs à poils longs",
      "Cache-oreilles avec liens",
      "Breloque dorée sur le rabat avant",
    ],
    upcycled: false,
  },
  {
    id: "mk-002",
    slug: "chapka-bleu-roi-motifs-dores",
    name: "Chapka bleu roi à motifs dorés",
    category: "couvre-chefs",
    description:
      "Une chapka bleu roi travaillée avec un tissu imprimé de motifs géométriques dorés, associée à une doublure blanche aux poils longs et à une breloque dorée.",
    images: [
      { src: "/images/chapka-bleue-produit.webp", width: 1254, height: 1254, kind: "produit", alt: "Chapka bleu roi à motifs géométriques dorés avec doublure blanche duveteuse et breloque dorée, posée sur une pierre" },
      { src: "/images/chapka-bleue-portee-face.webp", width: 1179, height: 1334, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka bleu roi à motifs dorés, vue de face" },
      { src: "/images/chapka-bleue-portee-profil.webp", width: 1082, height: 1454, kind: "portee", position: "50% 30%", alt: "Mannequin portant la chapka bleu roi à motifs dorés, vue de profil" },
      { src: "/images/chapka-bleue-detail-breloque.webp", width: 1049, height: 1499, kind: "detail", position: "50% 60%", alt: "Gros plan sur la breloque dorée posée sur la doublure blanche, tissu bleu à motifs dorés en arrière-plan" },
      { src: "/images/chapka-bleue-detail-lien.webp", width: 941, height: 1672, kind: "detail", position: "50% 45%", alt: "Gros plan sur le lien bleu bordé de tissu imprimé jaune et noir, posé sur une pierre ocre" },
    ],
    features: [
      "Tissu bleu roi à motifs géométriques dorés",
      "Doublure et rabats blancs à poils longs",
      "Cache-oreilles avec liens",
      "Breloque dorée sur le rabat avant",
    ],
    upcycled: false,
  },
  {
    id: "mk-003",
    slug: "chapka-marbree-doublure-camouflage",
    name: "Chapka marbrée, doublure camouflage",
    category: "couvre-chefs",
    description:
      "Un tissu à effet marbré bleu nuit, brique et blanc rencontre une doublure bouclée à motif camouflage, visible sur le rabat et les cache-oreilles.",
    images: [
      { src: "/images/chapka-marbree-produit.webp", width: 1254, height: 1254, kind: "produit", position: "50% 55%", alt: "Chapka à tissu marbré bleu nuit, brique et blanc, avec doublure bouclée camouflage, sur fond crème" },
      { src: "/images/chapka-marbree-portee.webp", width: 1122, height: 1402, kind: "portee", position: "50% 25%", alt: "Mannequin portant la chapka marbrée à doublure camouflage, lumière dorée" },
    ],
    features: [
      "Tissu à effet marbré bleu nuit, brique et blanc",
      "Doublure bouclée à motif camouflage",
      "Cache-oreilles",
    ],
    upcycled: false,
  },
  {
    id: "mk-004",
    slug: "lingettes-textiles",
    name: "Lingettes textiles imprimé & éponge",
    category: "accessoires",
    description:
      "Des carrés textiles qui associent une face en tissu imprimé jaune, fuchsia et noir à une face éponge turquoise. Chaque lingette porte une petite étiquette.",
    images: [
      { src: "/images/lingettes-textiles-produit.webp", width: 1188, height: 1324, kind: "produit", alt: "Deux lingettes textiles carrées posées sur une pierre : face imprimée jaune, fuchsia et noir, face éponge turquoise" },
      { src: "/images/lingettes-textiles-plateau.webp", width: 1197, height: 1314, kind: "scene", position: "50% 55%", alt: "Lingettes textiles présentées dans un plateau en bois" },
      { src: "/images/lingettes-textiles-detail.webp", width: 827, height: 1800, kind: "detail", position: "50% 50%", alt: "Pile de lingettes sur un panier en rotin, détail du tissu imprimé et de l’éponge turquoise" },
    ],
    features: [
      "Format carré",
      "Une face en tissu imprimé jaune, fuchsia et noir",
      "Une face éponge turquoise",
      "Étiquette cousue",
    ],
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
    features: [
      "Coupe ample, manches courtes",
      "Fond noir, lignes jaunes et pois rouges",
      "Ourlet souligné d’une bordure rouge",
    ],
    upcycled: false,
  },
  {
    id: "mk-006",
    slug: "chouchous-imprimes",
    name: "Chouchous imprimés",
    category: "accessoires",
    description:
      "Des chouchous en tissu froncé, présentés dans deux imprimés : un motif marbré bleu, brique, noir et blanc, et un bleu roi à motifs dorés. Une petite patte crème est cousue sur chacun.",
    images: [
      { src: "/images/chouchous-imprimes-produit.webp", width: 1122, height: 1402, kind: "produit", alt: "Chouchous en tissu posés à plat sur une pierre : deux à l’imprimé marbré bleu, brique, noir et blanc, un bleu roi à motifs dorés" },
      { src: "/images/chouchous-imprimes-porte.webp", width: 1122, height: 1402, kind: "portee", position: "50% 25%", alt: "Mannequin portant le chouchou bleu roi à motifs dorés sur une queue de cheval haute tressée" },
      { src: "/images/chouchous-imprimes-detail-imprimes.webp", width: 1122, height: 1402, kind: "detail", alt: "Gros plan sur les deux imprimés : bleu roi à motifs dorés et marbré bleu, brique, noir et blanc, avec la patte crème cousue" },
    ],
    features: [
      "Tissu froncé",
      "Imprimé marbré bleu, brique, noir et blanc",
      "Imprimé bleu roi à motifs dorés",
      "Petite patte crème cousue",
    ],
    variants: ["Marbré", "Bleu roi à motifs dorés"],
    upcycled: false,
  },
  {
    id: "mk-007",
    slug: "boucles-oreilles-textiles",
    name: "Boucles d’oreilles textiles",
    category: "accessoires",
    description:
      "Des boucles d’oreilles pendantes en tissu imprimé plié en forme de feuille, aux tons noir, brique, blanc et bleu. Chacune est montée sur un crochet doré, sous une perle facettée orangée et deux perles translucides.",
    images: [
      { src: "/images/boucles-oreilles-textiles-produit.webp", width: 1122, height: 1402, kind: "produit", alt: "Paire de boucles d’oreilles posée à plat : feuilles en tissu imprimé noir, brique, blanc et bleu, perles et crochets dorés" },
      { src: "/images/boucles-oreilles-textiles-portee.webp", width: 1122, height: 1402, kind: "portee", position: "50% 30%", alt: "Mannequin aux longues tresses portant une boucle d’oreille en tissu imprimé en forme de feuille" },
      { src: "/images/boucles-oreilles-textiles-presentoir.webp", width: 1122, height: 1402, kind: "scene", alt: "Paire de boucles d’oreilles textiles suspendue à un présentoir en bois clair" },
      { src: "/images/boucles-oreilles-textiles-detail-crochet.webp", width: 1122, height: 1402, kind: "detail", position: "50% 40%", alt: "Gros plan sur le crochet doré, la perle facettée orangée, les deux perles translucides et le tissu imprimé" },
    ],
    features: [
      "Forme de feuille en tissu plié",
      "Imprimé noir, brique, blanc et bleu",
      "Crochet doré",
      "Perle facettée orangée et deux perles translucides",
    ],
    upcycled: false,
  },
  {
    id: "mk-008",
    slug: "echarpe-cagoule-bleu-roi-dore",
    name: "Écharpe cagoule bleu roi et doré",
    category: "couvre-chefs",
    description:
      "Une écharpe à capuche bleu roi, parcourue de bandes et de médaillons imprimés jaune doré. La capuche se prolonge en deux pans terminés en pointe, et l’intérieur est doublé d’un tissu bleu uni.",
    images: [
      { src: "/images/echarpe-cagoule-bleu-roi-produit.webp", width: 1122, height: 1402, kind: "produit", alt: "Écharpe cagoule bleu roi et doré posée à plat : capuche doublée de bleu uni et deux pans imprimés de médaillons dorés" },
      { src: "/images/echarpe-cagoule-bleu-roi-portee-face.webp", width: 1122, height: 1402, kind: "portee", position: "50% 25%", alt: "Mannequin portant l’écharpe cagoule bleu roi et doré, capuche relevée, vue de face" },
      { src: "/images/echarpe-cagoule-bleu-roi-portee-trois-quarts.webp", width: 1122, height: 1402, kind: "portee", position: "50% 25%", alt: "Mannequin portant l’écharpe cagoule bleu roi et doré, capuche relevée, vue de trois quarts" },
      { src: "/images/echarpe-cagoule-bleu-roi-detail-imprime.webp", width: 1122, height: 1402, kind: "detail", position: "50% 45%", alt: "Gros plan sur l’imprimé bleu roi à bandes et médaillons jaune doré, le tissu et les coutures" },
    ],
    features: [
      "Capuche prolongée de deux pans",
      "Imprimé bleu roi à bandes et médaillons jaune doré",
      "Doublure bleue unie",
      "Pans terminés en pointe",
    ],
    upcycled: false,
  },
];
