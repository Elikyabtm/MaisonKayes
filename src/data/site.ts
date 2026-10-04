/**
 * Configuration centrale de Maison Kayes.
 *
 * Toute valeur laissée à `null` est masquée sur le site (aucun faux lien).
 * Renseigner ici les coordonnées confirmées, les réseaux et la boutique Etsy.
 */

export type SocialLink = {
  label: string;
  /** Identifiant affiché, ex. « @maisonkayes ». */
  handle: string;
  url: string;
};

export const site = {
  name: "Maison Kayes",
  tagline: "Afro Fusion — vêtements & accessoires",
  description:
    "Maison Kayes, marque de vêtements et accessoires Afro Fusion fondée par Fatoumata Gassama : inspirations africaines, création contemporaine et matières réinventées.",
  /** URL publique du site, utilisée pour les métadonnées et le sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maisonkayes.fr",
  locale: "fr_FR",
  founder: "Fatoumata Gassama",

  /** Logo fourni (ex. "/images/logo-maison-kayes.svg"). `null` = logotype typographique. */
  logoSrc: null as string | null,

  /** Boutique Etsy (page d’accueil de la boutique). */
  etsyShopUrl: null as string | null,

  contact: {
    email: null as string | null,
    phone: null as string | null,
    /** Ville ou zone d’activité, si elle doit apparaître. */
    location: null as string | null,
  },

  socials: [
    // { label: "Instagram", handle: "@…", url: "https://www.instagram.com/…" },
  ] as SocialLink[],

  credit: "Conception & développement : Elikya Botomba",
};

export const mainNav = [
  { href: "/", label: "Accueil" },
  { href: "/creations", label: "Créations" },
  { href: "/notre-univers", label: "Notre univers" },
  { href: "/upcycling", label: "Upcycling" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;

export const legalNav = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

export const instagram = () => site.socials.find((s) => s.label.toLowerCase() === "instagram") ?? null;
