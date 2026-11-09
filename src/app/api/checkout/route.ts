import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { DEFAULT_VARIANT } from "@/data/catalog-types";
import { getZone } from "@/data/shipping";
import { site } from "@/data/site";
import { getDb, schema } from "@/db";
import { getCurrentCustomer } from "@/lib/customer/session";
import { syncStripeCustomer } from "@/lib/customer/stripe-customer";
import { getStripe } from "@/lib/stripe";

/** Quantité maximale par commande. */
const MAX_QUANTITY = 10;

/**
 * Parcours de paiement unique du site : vérifie la pièce, la variante, le prix et le stock en base,
 * crée la session Stripe Checkout puis redirige le client vers la page de paiement Stripe.
 * La commande est enregistrée par le webhook une fois le paiement validé.
 */
export async function POST(request: Request) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? site.url : new URL(request.url).origin;
  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("slug") ?? "");
  const db = await getDb();
  const [product] = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.slug, slug), eq(schema.products.visible, true)))
    .limit(1);
  if (!product) return NextResponse.redirect(new URL("/creations", origin), 303);

  const back = (reason: "erreur" | "indisponible") =>
    NextResponse.redirect(new URL(`/creations/${product.slug}?paiement=${reason}`, origin), 303);

  const stripe = getStripe();
  const zone = getZone(String(form?.get("zone") ?? ""));
  const rateId = zone ? process.env[zone.rateEnv] : undefined;
  const variantId = Number(form?.get("variant"));
  if (!stripe || !zone || !rateId || !Number.isInteger(variantId)) return back("erreur");

  const [variant] = await db
    .select()
    .from(schema.variants)
    .where(and(eq(schema.variants.id, variantId), eq(schema.variants.productId, product.id), eq(schema.variants.active, true)))
    .limit(1);
  if (!variant) return back("erreur");
  if (!product.priceCents || product.priceCents <= 0 || variant.stock === null || variant.stock <= 0) return back("indisponible");

  const [image] = await db
    .select({ src: schema.productImages.src })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, product.id))
    .orderBy(schema.productImages.sort)
    .limit(1);

  // Client connecté (facultatif) : e-mail et adresse pré-remplis, commande rattachée au compte.
  const customer = await getCurrentCustomer();
  const stripeCustomerId = customer ? await syncStripeCustomer(stripe, customer) : null;

  const label = variant.name === DEFAULT_VARIANT ? product.name : `${product.name} — ${variant.name}`;
  const max = Math.min(variant.stock, MAX_QUANTITY);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: product.priceCents,
            product_data: {
              name: label,
              // Stripe n’affiche que des images publiques en https.
              ...(image && origin.startsWith("https://") && { images: [new URL(image.src, origin).toString()] }),
              metadata: { productId: product.id, variantId: String(variant.id) },
            },
          },
          ...(max > 1 && { adjustable_quantity: { enabled: true, minimum: 1, maximum: max } }),
        },
      ],
      shipping_address_collection: {
        allowed_countries: zone.countries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      shipping_options: [{ shipping_rate: rateId }],
      phone_number_collection: { enabled: true },
      ...(stripeCustomerId
        ? { customer: stripeCustomerId, customer_update: { shipping: "auto" as const } }
        : customer
          ? { customer_email: customer.email }
          : {}),
      metadata: {
        productId: product.id,
        productName: product.name,
        variantId: String(variant.id),
        zone: zone.id,
        ...(customer && { customerId: String(customer.id) }),
      },
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
