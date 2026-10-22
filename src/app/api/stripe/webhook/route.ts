import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { applyPaidOrder } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

/** Webhook Stripe : met à jour le stock quand un paiement est confirmé. */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Signature absente");
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      try {
        await applyPaidOrder(stripe, session.id);
      } catch (error) {
        console.error("[boutique] Traitement de la commande impossible", error);
        // 500 : Stripe renverra l’événement plus tard.
        return NextResponse.json({ error: "Traitement impossible" }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
