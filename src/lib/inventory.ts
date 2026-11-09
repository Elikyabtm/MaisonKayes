import "server-only";
import { eq } from "drizzle-orm";
import { schema, type Db } from "@/db";
import type { StockReason } from "@/db/schema";

const { variants, stockMovements } = schema;

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export class StockError extends Error {}

/**
 * Modifie le stock d’une variante et trace le mouvement, dans une transaction existante.
 * - `delta` : ajoute ou retire une quantité (un stock « à renseigner » compte comme 0).
 * - `set` : fixe la quantité (inventaire).
 */
export async function moveStock(
  tx: Tx,
  input: {
    variantId: number;
    mode: "delta" | "set";
    value: number;
    reason: StockReason;
    note?: string | null;
    orderId?: number | null;
    adminUserId?: number | null;
  },
) {
  const [row] = await tx.select().from(variants).where(eq(variants.id, input.variantId)).for("update");
  if (!row) throw new StockError("Variante introuvable.");
  if (!Number.isInteger(input.value)) throw new StockError("La quantité doit être un nombre entier.");
  const before = row.stock;
  const after = input.mode === "set" ? input.value : (before ?? 0) + input.value;
  if (after < 0) throw new StockError(`Stock insuffisant : ${before ?? 0} disponible(s).`);
  const delta = after - (before ?? 0);
  if (delta === 0 && before !== null) return { before, after, changed: false };
  await tx.update(variants).set({ stock: after }).where(eq(variants.id, row.id));
  await tx.insert(stockMovements).values({
    variantId: row.id,
    delta,
    stockBefore: before,
    stockAfter: after,
    reason: input.reason,
    note: input.note || null,
    orderId: input.orderId ?? null,
    adminUserId: input.adminUserId ?? null,
  });
  return { before, after, changed: true, productId: row.productId };
}
