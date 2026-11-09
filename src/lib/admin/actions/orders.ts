"use server";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { FulfillmentStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { cancelOrder } from "@/lib/orders";
import { backTo, done, int } from "./util";

const ACTIVE: FulfillmentStatus[] = ["a_preparer", "expediee", "remise"];

/** Statut de préparation, transporteur, numéro de suivi et note interne. */
export async function updateOrder(formData: FormData) {
  await requireAdmin();
  const id = int(formData.get("id"));
  const back = backTo(formData, `/admin/commandes/${id}`);
  const status = String(formData.get("statut") ?? "") as FulfillmentStatus;
  const db = await getDb();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!order) done(back, "erreur", "introuvable");
  if (order.fulfillmentStatus === "annulee") done(back, "erreur", "annulee_deja");
  if (!ACTIVE.includes(status)) done(back, "erreur", "introuvable");

  const clean = (k: string) => String(formData.get(k) ?? "").trim().slice(0, 500) || null;
  const now = new Date();
  await db
    .update(schema.orders)
    .set({
      fulfillmentStatus: status,
      carrier: clean("transporteur"),
      trackingNumber: clean("suivi"),
      note: clean("note"),
      shippedAt: status === "a_preparer" ? null : (order.shippedAt ?? now),
      deliveredAt: status === "remise" ? (order.deliveredAt ?? now) : null,
      updatedAt: now,
    })
    .where(eq(schema.orders.id, id));
  done(back, "ok", status !== order.fulfillmentStatus ? "statut" : "suivi");
}

/** Annulation, avec remise en stock facultative. Le remboursement se fait dans Stripe. */
export async function cancelOrderAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = int(formData.get("id"));
  const back = backTo(formData, `/admin/commandes/${id}`);
  const db = await getDb();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!order) done(back, "erreur", "introuvable");
  if (order.fulfillmentStatus === "annulee") done(back, "erreur", "annulee_deja");
  const restock = formData.get("remettre_en_stock") === "on";
  const note = String(formData.get("motif") ?? "").trim().slice(0, 500);
  await cancelOrder(id, {
    restock,
    adminUserId: admin.id,
    note: `Annulée par ${admin.name}${note ? ` : ${note}` : ""}.`,
  });
  done(back, "ok", restock && order.stockApplied ? "annulee_stock" : "annulee");
}
