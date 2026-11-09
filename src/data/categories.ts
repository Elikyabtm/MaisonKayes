/** Catégories du catalogue, dans l’ordre des filtres. */
export const categoryIds = ["vetements", "couvre-chefs", "accessoires"] as const;
export type Category = (typeof categoryIds)[number];

export const categories: Record<Category, { label: string; singular: string }> = {
  vetements: { label: "Vêtements", singular: "Vêtement" },
  "couvre-chefs": { label: "Couvre-chefs", singular: "Couvre-chef" },
  accessoires: { label: "Accessoires", singular: "Accessoire" },
};

/** Anciennes catégories et leur remplaçante (anciens liens ?categorie=…). */
export const legacyCategories: Record<string, Category> = {
  lingettes: "accessoires",
};

export const isCategory = (value: unknown): value is Category =>
  typeof value === "string" && (categoryIds as readonly string[]).includes(value);
