import "server-only";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db";

/** Rafraîchit les pages publiques qui affichent ces produits (prix, stock, fiche). */
export async function revalidateProducts(productIds: (string | null | undefined)[]) {
  const ids = [...new Set(productIds.filter((id): id is string => Boolean(id)))];
  if (ids.length) {
    const db = await getDb();
    const rows = await db.select({ slug: schema.products.slug }).from(schema.products).where(inArray(schema.products.id, ids));
    for (const r of rows) revalidatePath(`/creations/${r.slug}`);
  }
  revalidatePath("/creations");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}
