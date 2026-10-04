import type { Metadata } from "next";
import { site } from "@/data/site";

/** Métadonnées d’une page : titre, description, URL canonique et Open Graph. */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title?: string;
  description: string;
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
}): Metadata {
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — Afro Fusion, vêtements & accessoires`;
  const og = image ?? { url: "/og-maison-kayes.jpg", width: 1200, height: 630, alt: "Robe à motifs géométriques Maison Kayes dans la lumière ocre" };
  return {
    title: title ?? { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      images: [og],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [og.url] },
  };
}
