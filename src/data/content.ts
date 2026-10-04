/**
 * Textes éditoriaux centralisés.
 * Les sections vides (tableaux vides, `null`) ne sont pas affichées :
 * il suffit de les compléter pour qu’elles apparaissent.
 */

export const about = {
  role: "Fondatrice de Maison Kayes",
  intro: [
    "Fatoumata Gassama a fondé Maison Kayes, une marque de vêtements et d’accessoires Afro Fusion.",
    "Ses créations font dialoguer inspirations africaines et création contemporaine, avec une démarche d’upcycling : redonner une place aux matières plutôt que de les laisser de côté.",
  ],
  /** Parcours de la créatrice — à compléter. */
  journey: [] as string[],
  /** Histoire du nom « Maison Kayes » — à compléter. */
  nameStory: null as string | null,
  /** Inspirations — à compléter. */
  inspirations: [] as string[],
};

export const upcyclingSteps = [
  {
    title: "Sélectionner les matières",
    text: "Tout commence par le regard porté sur un tissu : sa couleur, sa texture, ce qu’il peut encore offrir.",
  },
  {
    title: "Imaginer une nouvelle association",
    text: "Un imprimé rencontre une doublure, un motif répond à une matière : la pièce se dessine dans le contraste.",
  },
  {
    title: "Transformer et assembler",
    text: "Découper, ajuster, coudre. La matière change de forme et prend une nouvelle fonction.",
  },
  {
    title: "Donner une nouvelle vie",
    text: "La pièce terminée porte en elle l’histoire de ses matières et commence un nouveau chapitre.",
  },
];

export type TransformationProject = {
  slug: string;
  title: string;
  /** Matières de départ, telles que confirmées par la créatrice. */
  materials: string;
  /** Pièce obtenue. */
  result: string;
  description: string;
  images: { src: string; width: number; height: number; alt: string }[];
  /** Fiche produit liée, si la pièce est au catalogue. */
  productSlug?: string;
};

/**
 * Projets de transformation réels, à ajouter lorsqu’ils sont documentés
 * (photos des matières de départ et de la pièce finie).
 */
export const transformationProjects: TransformationProject[] = [];
