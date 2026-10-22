import "server-only";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { products } from "@/data/products";
import { readStock } from "./shop";

/**
 * Applique une commande payée : décrémente le stock (métadonnée `stock` du produit Stripe)
 * et rafraîchit les pages concernées. Idempotent grâce au marqueur `stock_applied` posé
 * sur le paiement. Si une pièce n’avait plus de stock (deux paiements simultanés),
 * la commande est remboursée intégralement.
 */
export async function applyPaidOrder(stripe: Stripe, sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  const intent = session.payment_intent;
  if (!intent || typeof intent === "string") throw new Error(`Session ${sessionId} sans paiement`);
  if (intent.metadata.stock_applied === "true") return { skipped: true as const };

  const items = await stripe.checkout.sessions.listLineItems(sessionId, { expand: ["data.price.product"], limit: 100 });
  let oversold = false;
  const touched: string[] = [];

  for (const item of items.data) {
    const product = item.price?.product;
    if (!product || typeof product === "string" || product.deleted) continue;
    touched.push(product.id);
    const stock = readStock(product.metadata);
    if (stock === null) continue;
    const quantity = item.quantity ?? 1;
    if (stock < quantity) oversold = true;
    await stripe.products.update(product.id, { metadata: { stock: String(Math.max(0, stock - quantity)) } });
  }

  if (oversold) {
    await stripe.refunds.create({ payment_intent: intent.id, metadata: { motif: "stock_epuise" } });
    console.warn(`[boutique] Commande ${sessionId} remboursée : stock insuffisant`);
  }
  await stripe.paymentIntents.update(intent.id, {
    metadata: { stock_applied: "true", ...(oversold && { rembourse_stock_epuise: "true" }) },
  });

  for (const p of products.filter((p) => p.stripeProductId && touched.includes(p.stripeProductId))) {
    revalidatePath(`/creations/${p.slug}`);
  }
  revalidatePath("/creations");
  revalidatePath("/");
  return { skipped: false as const, oversold };
}
