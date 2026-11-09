"use server";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { orderEmailKinds, type FulfillmentStatus, type OrderEmailKind } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { sendOrderEmail } from "@/lib/email/order-emails";
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
  const trackingUrl = clean("lien_suivi");
  if (trackingUrl && !/^https?:\/\/[^\s]+$/i.test(trackingUrl)) done(back, "erreur", "lien_suivi");
  const now = new Date();
  await db
    .update(schema.orders)
    .set({
      fulfillmentStatus: status,
      carrier: clean("transporteur"),
      trackingNumber: clean("suivi"),
      trackingUrl,
      note: clean("note"),
      shippedAt: status === "a_preparer" ? null : (order.shippedAt ?? now),
      deliveredAt: status === "remise" ? (order.deliveredAt ?? now) : null,
      updatedAt: now,
    })
    .where(eq(schema.orders.id, id));

  // Premier passage à « Expédiée » : avis d’expédition au client.
  // La réservation en base garantit un seul envoi, même si le statut est enregistré plusieurs fois.
  if (status === "expediee") {
    const result = await sendOrderEmail(id, "expedition");
    if (result.outcome === "echec") done(back, "erreur", "email_expedition_echec");
    if (result.outcome === "envoye") done(back, "ok", "statut_email");
  }
  done(back, "ok", status !== order.fulfillmentStatus ? "statut" : "suivi");
}

/** Relance manuelle d’un seul e-mail de commande (en échec, ou jamais parti). */
export async function retryOrderEmail(formData: FormData) {
  await requireAdmin();
  const id = int(formData.get("id"));
  const kind = String(formData.get("type") ?? "") as OrderEmailKind;
  const back = backTo(formData, `/admin/commandes/${id}`);
  if (!orderEmailKinds.includes(kind)) done(back, "erreur", "introuvable");
  const db = await getDb();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!order) done(back, "erreur", "introuvable");
  const eligible =
    kind === "expedition"
      ? Boolean(order.shippedAt) && order.fulfillmentStatus !== "annulee"
      : order.paymentStatus === "paye" && order.fulfillmentStatus !== "annulee";
  if (!eligible) done(back, "erreur", "email_non_applicable");
  const result = await sendOrderEmail(id, kind, { retry: true });
  if (result.outcome === "echec") done(back, "erreur", "email_echec");
  done(back, "ok", result.outcome === "envoye" ? "email_envoye" : "email_deja");
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
