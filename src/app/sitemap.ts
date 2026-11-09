import type { MetadataRoute } from "next";
import { mainNav, site } from "@/data/site";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = mainNav.map((n) => n.href);
  const productPages = (await getCatalog()).map((p) => `/creations/${p.slug}`);
  return [...pages, ...productPages].map((path) => ({ url: new URL(path, site.url).toString() }));
}
