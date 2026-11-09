import "server-only";
import { and, eq, isNotNull } from "drizzle-orm";
import type Stripe from "stripe";
import { getZone } from "@/data/shipping";
import { getDb, schema } from "@/db";
import type { PaymentStatus } from "@/db/schema";
import { sendPaidOrderEmails } from "./email/order-emails";
import { moveStock, StockError } from "./inventory";
import { revalidateProducts } from "./revalidate";

const { orders, orderItems, variants, customers } = schema;

export const orderReference = (id: number) => `MK-${String(id).padStart(5, "0")}`;

const paymentStatusOf = (s: Stripe.Checkout.Session): PaymentStatus =>
  s.payment_status === "unpaid" ? "en_attente" : "paye";

const intentId = (s: Stripe.Checkout.Session) =>
  typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null);

/**
 * Enregistre la commande d’une session Checkout terminée et retire le stock vendu.
 * Idempotent : un même événement rejoué ne crée ni doublon ni second décrément.
 * Si une variante n’a plus assez de stock (deux paiements simultanés), rien n’est retiré,
 * la commande est annulée et remboursée si elle est payée.
 */
export async function recordCheckout(stripe: Stripe, sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  const db = await getDb();

  const productId = session.metadata?.productId ?? null;
  const variantId = session.metadata?.variantId ? Number(session.metadata.variantId) : null;
  const zone = session.metadata?.zone ? getZone(session.metadata.zone) : undefined;
  const lines = session.line_items?.data ?? [];
  const shipping = session.collected_information?.shipping_details ?? null;
  const address = shipping?.address ?? session.customer_details?.address ?? null;

  // Événement rejoué : rien à faire (évite aussi de consommer un numéro de référence).
  const [existing] = await db.select({ id: orders.id }).from(orders).where(eq(orders.stripeSessionId, session.id)).limit(1);
  if (existing) return { created: false as const };

  // Compte client : celui connecté au moment du paiement, sinon un compte à l’adresse confirmée.
  const metaCustomer = Number(session.metadata?.customerId) || null;
  const email = session.customer_details?.email?.toLowerCase() ?? null;
  const [account] = metaCustomer
    ? await db.select().from(customers).where(eq(customers.id, metaCustomer)).limit(1)
    : email
      ? await db.select().from(customers).where(and(eq(customers.email, email), isNotNull(customers.emailVerifiedAt))).limit(1)
      : [];

  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        stripeSessionId: session.id,
        stripePaymentIntentId: intentId(session),
        customerId: account?.id ?? null,
        customerName: session.customer_details?.name ?? null,
        customerEmail: session.customer_details?.email ?? null,
        customerPhone: session.customer_details?.phone ?? null,
        shippingName: shipping?.name ?? session.customer_details?.name ?? null,
        shippingAddress: address && {
          line1: address.line1 ?? null,
          line2: address.line2 ?? null,
          postalCode: address.postal_code ?? null,
          city: address.city ?? null,
          state: address.state ?? null,
          country: address.country ?? null,
        },
        shippingZone: zone?.id ?? session.metadata?.zone ?? null,
        shippingLabel: zone?.label ?? null,
        subtotalCents: session.amount_subtotal ?? 0,
        shippingCents: session.shipping_cost?.amount_total ?? 0,
        totalCents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        paymentStatus: paymentStatusOf(session),
      })
      .onConflictDoNothing({ target: orders.stripeSessionId })
      .returning();
    if (!order) return { created: false as const };

    await tx.update(orders).set({ reference: orderReference(order.id) }).where(eq(orders.id, order.id));

    // Nom de la variante au moment de l’achat.
    const variant = variantId
      ? (await tx.select().from(variants).where(eq(variants.id, variantId)).limit(1))[0]
      : undefined;
    const items = lines.map((l) => ({
      orderId: order.id,
      productId: productId,
      variantId: variant?.id ?? null,
      productName: session.metadata?.productName ?? l.description ?? "Article",
      variantName: variant && variant.name !== "Unique" ? variant.name : null,
      unitCents: l.price?.unit_amount ?? Math.round(l.amount_total / Math.max(1, l.quantity ?? 1)),
      quantity: l.quantity ?? 1,
      totalCents: l.amount_total,
    }));
    if (items.length) await tx.insert(orderItems).values(items);

    // Retrait du stock : tout ou rien.
    const quantity = items.reduce((n, i) => n + i.quantity, 0);
    if (variant) {
      try {
        await moveStock(tx, {
          variantId: variant.id,
          mode: "delta",
          value: -quantity,
          reason: "vente",
          note: orderReference(order.id),
          orderId: order.id,
        });
        await tx.update(orders).set({ stockApplied: true }).where(eq(orders.id, order.id));
      } catch (error) {
        if (!(error instanceof StockError)) throw error;
        await tx
          .update(orders)
          .set({
            fulfillmentStatus: "annulee",
            cancelledAt: new Date(),
            note: "Annulée automatiquement : stock insuffisant au moment du paiement.",
          })
          .where(eq(orders.id, order.id));
        return { created: true as const, orderId: order.id, oversold: true, productId };
      }
    }
    return { created: true as const, orderId: order.id, oversold: false, productId };
  });

  if (result.created && result.oversold && paymentStatusOf(session) === "paye") {
    await refundOrder(stripe, result.orderId, session.payment_intent, "stock_epuise");
  }
  if (result.created) await revalidateProducts([result.productId]);
  // Première commande d’un compte sans adresse enregistrée : on garde l’adresse de livraison.
  if (result.created && account && !account.shippingAddress && shipping?.address?.line1) {
    const s = shipping.address;
    await db
      .update(customers)
      .set({
        shippingAddress: {
          name: shipping.name ?? account.name,
          line1: s.line1 ?? null,
          line2: s.line2 ?? null,
          postalCode: s.postal_code ?? null,
          city: s.city ?? null,
          state: s.state ?? null,
          country: s.country ?? null,
        },
        updatedAt: new Date(),
      })
      .where(eq(customers.id, account.id));
  }
  // Commande enregistrée et payée : confirmation au client et notification interne (une seule fois chacune).
  if (result.created && !result.oversold && paymentStatusOf(session) === "paye") {
    await sendPaidOrderEmails(result.orderId);
  }
  return result;
}

async function refundOrder(stripe: Stripe, orderId: number, intent: Stripe.Checkout.Session["payment_intent"], motif: string) {
  const pi = typeof intent === "string" ? intent : intent?.id;
  if (!pi) return;
  await stripe.refunds.create({ payment_intent: pi, metadata: { motif } }, { idempotencyKey: `refund-${orderId}-${motif}` });
  const db = await getDb();
  await db.update(orders).set({ paymentStatus: "rembourse", updatedAt: new Date() }).where(eq(orders.id, orderId));
  console.warn(`[boutique] Commande ${orderReference(orderId)} remboursée (${motif})`);
}

/** Paiement différé confirmé (virement, certains moyens locaux). */
export async function markAsyncPaid(stripe: Stripe, sessionId: string) {
  const db = await getDb();
  let [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  if (!order) {
    await recordCheckout(stripe, sessionId);
    [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  }
  if (!order) return;
  await db.update(orders).set({ paymentStatus: "paye", updatedAt: new Date() }).where(eq(orders.id, order.id));
  // Commande annulée faute de stock pendant que le paiement était en attente : on rembourse.
  if (order.fulfillmentStatus === "annulee" && !order.stockApplied) {
    await refundOrder(stripe, order.id, order.stripePaymentIntentId, "stock_epuise");
    return;
  }
  // Paiement différé confirmé : e-mails de commande (déjà envoyés si la commande était payée dès le départ).
  if (order.fulfillmentStatus !== "annulee") await sendPaidOrderEmails(order.id);
}

/** Paiement différé refusé : commande annulée et stock remis en vente. */
export async function markAsyncFailed(sessionId: string) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  if (!order) return;
  await cancelOrder(order.id, { restock: true, paymentStatus: "echoue", note: "Paiement refusé." });
}

/** Remboursement effectué (depuis Stripe ou automatiquement). */
export async function markRefunded(charge: Stripe.Charge) {
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi) return;
  const db = await getDb();
  const full = charge.amount_refunded >= charge.amount;
  await db
    .update(orders)
    .set({
      refundedCents: charge.amount_refunded,
      paymentStatus: full ? "rembourse" : "partiellement_rembourse",
      updatedAt: new Date(),
    })
    .where(eq(orders.stripePaymentIntentId, pi));
}

/**
 * Annule une commande. Avec `restock`, remet en stock les articles retirés à la commande
 * (mouvement « Commande annulée »), une seule fois.
 */
export async function cancelOrder(
  orderId: number,
  opts: { restock: boolean; adminUserId?: number | null; paymentStatus?: PaymentStatus; note?: string | null },
) {
  const db = await getDb();
  const touched = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order) throw new Error("Commande introuvable.");
    const products: (string | null)[] = [];
    if (opts.restock && order.stockApplied) {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) {
        if (!item.variantId) continue;
        await moveStock(tx, {
          variantId: item.variantId,
          mode: "delta",
          value: item.quantity,
          reason: "annulation",
          note: order.reference,
          orderId,
          adminUserId: opts.adminUserId,
        });
        products.push(item.productId);
      }
    }
    await tx
      .update(orders)
      .set({
        fulfillmentStatus: "annulee",
        cancelledAt: order.cancelledAt ?? new Date(),
        stockApplied: opts.restock ? false : order.stockApplied,
        ...(opts.paymentStatus && { paymentStatus: opts.paymentStatus }),
        ...(opts.note && { note: order.note ? `${order.note}\n${opts.note}` : opts.note }),
        updatedAt: new Date(),
      })
      .where(and(eq(orders.id, orderId)));
    return products;
  });
  if (touched.length) await revalidateProducts(touched);
}
