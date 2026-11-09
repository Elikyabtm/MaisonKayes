import { count } from "drizzle-orm";
import type { Db } from "./client";
import { productImages, products, variants } from "./schema";
import { seedProducts } from "./seed-data";

/** Importe le catalogue de départ si la table des produits est vide. */
export async function seedCatalog(db: Db) {
  const [{ n }] = await db.select({ n: count() }).from(products);
  if (n > 0) return;
  await db.transaction(async (tx) => {
    for (const [i, p] of seedProducts.entries()) {
      await tx.insert(products).values({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        features: p.features,
        upcycled: p.upcycled,
        sort: i,
      });
      if (p.images.length) {
        await tx.insert(productImages).values(
          p.images.map((img, j) => ({
            productId: p.id,
            src: img.src,
            width: img.width,
            height: img.height,
            alt: img.alt,
            kind: img.kind,
            position: img.position ?? null,
            sort: j,
          })),
        );
      }
      await tx.insert(variants).values((p.variants ?? ["Unique"]).map((name, j) => ({ productId: p.id, name, sort: j })));
    }
  });
}
