import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { mainNav, site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = mainNav.map((n) => n.href);
  const productPages = products.map((p) => `/creations/${p.slug}`);
  return [...pages, ...productPages].map((path) => ({ url: new URL(path, site.url).toString() }));
}
