"use server";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { stockReasons, type StockReason } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { moveStock, StockError } from "@/lib/inventory";
import { revalidateProducts } from "@/lib/revalidate";
import { backTo, done, int } from "./util";

/** Motifs proposés à la saisie manuelle (« vente » et « annulation » sont automatiques). */
const MANUAL: StockReason[] = ["reception", "correction", "retour", "perte", "autre"];

/** Ajouter, retirer ou fixer la quantité d’une variante, avec motif tracé dans l’historique. */
export async function moveStockAction(formData: FormData) {
  const admin = await requireAdmin();
  const back = backTo(formData, "/admin/stocks");
  const variantId = int(formData.get("variante"));
  const quantity = int(formData.get("quantite"));
  const op = String(formData.get("operation") ?? "");
  const reason = String(formData.get("motif") ?? "") as StockReason;
  if (!Number.isInteger(variantId)) done(back, "erreur", "introuvable");
  if (!Number.isInteger(quantity) || quantity < 0 || (op !== "fixer" && quantity === 0)) done(back, "erreur", "quantite");
  if (!MANUAL.includes(reason) || !(reason in stockReasons)) done(back, "erreur", "motif");
  if (!["ajouter", "retirer", "fixer"].includes(op)) done(back, "erreur", "quantite");

  const db = await getDb();
  let productId: string | undefined;
  try {
    const r = await db.transaction((tx) =>
      moveStock(tx, {
        variantId,
        mode: op === "fixer" ? "set" : "delta",
        value: op === "retirer" ? -quantity : quantity,
        reason,
        note: String(formData.get("note") ?? "").trim().slice(0, 300) || null,
        adminUserId: admin.id,
      }),
    );
    productId = r.productId;
  } catch (error) {
    if (error instanceof StockError) done(back, "erreur", error.message.startsWith("Stock insuffisant") ? "stock_insuffisant" : "introuvable");
    throw error;
  }
  if (productId) await revalidateProducts([productId]);
  done(back, "ok", "stock");
}

export async function setThresholdAction(formData: FormData) {
  await requireAdmin();
  const back = backTo(formData, "/admin/stocks");
  const variantId = int(formData.get("variante"));
  const threshold = int(formData.get("seuil"));
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 9999) done(back, "erreur", "quantite");
  const db = await getDb();
  const [v] = await db
    .update(schema.variants)
    .set({ lowStockThreshold: threshold })
    .where(eq(schema.variants.id, variantId))
    .returning();
  if (!v) done(back, "erreur", "introuvable");
  done(back, "ok", "seuil");
}
