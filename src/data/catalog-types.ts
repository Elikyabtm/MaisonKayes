import type { Category } from "./categories";

/** Types du catalogue partagés entre serveur et composants clients. */

export type ImageKind = "produit" | "portee" | "detail" | "scene";

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: ImageKind;
  /** Cadrage CSS `object-position`, réglé image par image. */
  position?: string | null;
};

export type CatalogVariant = {
  id: number;
  name: string;
  /** `null` = stock à renseigner. */
  stock: number | null;
  available: boolean;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  features: string[];
  images: ProductImage[];
  priceCents: number | null;
  currency: string;
  /** Prix formaté (« 25,00 € ») ou `null` si non renseigné. */
  price: string | null;
  upcycled: boolean;
  /** Variantes actives ; une seule nommée « Unique » pour une pièce sans déclinaison. */
  variants: CatalogVariant[];
  /** Prix renseigné et au moins une variante en stock. */
  purchasable: boolean;
  /** Stock connu et épuisé pour toutes les variantes. */
  soldOut: boolean;
};

export const DEFAULT_VARIANT = "Unique";

/** Une pièce a des déclinaisons visibles si elle a plusieurs variantes ou une variante nommée. */
export const hasVisibleVariants = (p: Pick<CatalogProduct, "variants">) =>
  p.variants.length > 1 || (p.variants.length === 1 && p.variants[0].name !== DEFAULT_VARIANT);
