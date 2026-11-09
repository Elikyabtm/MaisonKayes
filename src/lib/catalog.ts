import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { isCategory } from "@/data/categories";
import type { CatalogProduct, ImageKind } from "@/data/catalog-types";
import { getDb, schema } from "@/db";
import { formatMoney } from "./money";

const { products, productImages, variants } = schema;

type ProductRow = typeof products.$inferSelect;

async function hydrate(rows: ProductRow[]): Promise<CatalogProduct[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const ids = rows.map((r) => r.id);
  const [imgs, vars] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sort), asc(productImages.id)),
    db
      .select()
      .from(variants)
      .where(and(inArray(variants.productId, ids), eq(variants.active, true)))
      .orderBy(asc(variants.sort), asc(variants.id)),
  ]);
  return rows.map((p) => {
    const pv = vars
      .filter((v) => v.productId === p.id)
      .map((v) => ({ id: v.id, name: v.name, stock: v.stock, available: v.stock !== null && v.stock > 0 }));
    const priced = p.priceCents !== null && p.priceCents > 0;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: isCategory(p.category) ? p.category : "accessoires",
      description: p.description,
      features: p.features,
      images: imgs
        .filter((i) => i.productId === p.id)
        .map((i) => ({ src: i.src, width: i.width, height: i.height, alt: i.alt, kind: i.kind as ImageKind, position: i.position })),
      priceCents: p.priceCents,
      currency: p.currency,
      price: priced ? formatMoney(p.priceCents!, p.currency) : null,
      upcycled: p.upcycled,
      variants: pv,
      purchasable: priced && pv.some((v) => v.available),
      soldOut: pv.length > 0 && pv.every((v) => v.stock === 0),
    };
  });
}

/** Fiches visibles, dans l’ordre du catalogue. */
export async function getCatalog(): Promise<CatalogProduct[]> {
  const db = await getDb();
  const rows = await db.select().from(products).where(eq(products.visible, true)).orderBy(asc(products.sort), asc(products.name));
  return hydrate(rows);
}

/** Fiche visible par son slug, ou `null`. */
export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const db = await getDb();
  const rows = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.visible, true))).limit(1);
  return (await hydrate(rows))[0] ?? null;
}
