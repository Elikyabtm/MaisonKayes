import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getProduct } from "@/data/products";
import { getZone } from "@/data/shipping";
import { site } from "@/data/site";
import { toOffer } from "@/lib/shop";
import { getStripe } from "@/lib/stripe";

/** Quantité maximale par commande pour une pièce dont le stock n’est pas suivi. */
const MAX_QUANTITY = 10;

/**
 * Crée une session Stripe Checkout pour une pièce et une zone de livraison,
 * puis redirige le client vers la page de paiement Stripe.
 */
export async function POST(request: Request) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? site.url : new URL(request.url).origin;
  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("slug") ?? "");
  const product = getProduct(slug);
  if (!product) return NextResponse.redirect(new URL("/creations", origin), 303);

  const back = (reason: "erreur" | "indisponible") =>
    NextResponse.redirect(new URL(`/creations/${product.slug}?paiement=${reason}`, origin), 303);

  const stripe = getStripe();
  const zone = getZone(String(form?.get("zone") ?? ""));
  const rateId = zone ? process.env[zone.rateEnv] : undefined;
  if (!stripe || !product.stripeProductId || !zone || !rateId) return back("erreur");

  try {
    // Lecture directe (sans cache) pour vérifier le prix et le stock au moment de la commande.
    const stripeProduct = await stripe.products.retrieve(product.stripeProductId, { expand: ["default_price"] });
    const offer = toOffer(stripeProduct);
    if (!offer || !offer.available) return back("indisponible");

    const max = Math.min(offer.stock ?? MAX_QUANTITY, MAX_QUANTITY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      line_items: [
        {
          price: offer.priceId,
          quantity: 1,
          ...(max > 1 && { adjustable_quantity: { enabled: true, minimum: 1, maximum: max } }),
        },
      ],
      shipping_address_collection: {
        allowed_countries: zone.countries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      shipping_options: [{ shipping_rate: rateId }],
      phone_number_collection: { enabled: true },
      metadata: { slug: product.slug, zone: zone.id },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      custom_text: {
        submit: {
          message: `En validant, vous acceptez les conditions générales de vente de Maison Kayes : ${site.url}/conditions-generales-de-vente`,
        },
      },
      success_url: `${origin}/commande/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/creations/${product.slug}?paiement=annule`,
    });
    if (!session.url) return back("erreur");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("[boutique] Création de la session de paiement impossible", error);
    return back("erreur");
  }
}
