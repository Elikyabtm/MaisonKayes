import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { markAsyncFailed, markAsyncPaid, markRefunded, recordCheckout } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

/**
 * Webhook Stripe. Événements à activer :
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, charge.refunded.
 */
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

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await recordCheckout(stripe, event.data.object.id);
        break;
      case "checkout.session.async_payment_succeeded":
        await markAsyncPaid(stripe, event.data.object.id);
        break;
      case "checkout.session.async_payment_failed":
        await markAsyncFailed(event.data.object.id);
        break;
      case "charge.refunded":
        await markRefunded(event.data.object);
        break;
    }
  } catch (error) {
    console.error(`[boutique] Traitement de ${event.type} impossible`, error);
    // 500 : Stripe renverra l’événement plus tard.
    return NextResponse.json({ error: "Traitement impossible" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
