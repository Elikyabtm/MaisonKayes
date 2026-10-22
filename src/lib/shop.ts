import "server-only";
import type Stripe from "stripe";
import { products, type Product } from "@/data/products";
import { shippingZones, type ShippingZone } from "@/data/shipping";
import { getStripe } from "./stripe";

/** Offre d’un produit telle que configurée dans Stripe. */
export type Offer = {
  productId: string;
  priceId: string;
  amount: number;
  currency: string;
  /** Prix formaté, ex. « 85,00 € ». */
  price: string;
  /** Quantité disponible ; `null` = stock non suivi (pas de limite). */
  stock: number | null;
  available: boolean;
};

export type ZoneRate = ShippingZone & { rateId: string; price: string | null };

export const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);

/** Lit la métadonnée `stock` : entier ≥ 0, ou `null` si absente (stock non suivi). */
export function readStock(metadata: Stripe.Metadata): number | null {
  const raw = metadata.stock?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function toOffer(product: Stripe.Product): Offer | null {
  const price = product.default_price;
  if (!price || typeof price === "string" || !price.active || price.unit_amount == null) return null;
  const stock = readStock(product.metadata);
  return {
    productId: product.id,
    priceId: price.id,
    amount: price.unit_amount,
    currency: price.currency,
    price: formatMoney(price.unit_amount, price.currency),
    stock,
    available: product.active && (stock === null || stock > 0),
  };
}

/** Offres de tous les produits reliés à Stripe, indexées par slug. Vide si Stripe est indisponible. */
export async function getOffers(): Promise<Record<string, Offer>> {
  const stripe = getStripe();
  const linked = products.filter((p): p is Product & { stripeProductId: string } => Boolean(p.stripeProductId));
  if (!stripe || linked.length === 0) return {};
  try {
    const list = await stripe.products.list({
      ids: linked.map((p) => p.stripeProductId),
      expand: ["data.default_price"],
      limit: 100,
    });
    const offers: Record<string, Offer> = {};
    for (const p of linked) {
      const sp = list.data.find((d) => d.id === p.stripeProductId);
      const offer = sp && toOffer(sp);
      if (offer) offers[p.slug] = offer;
    }
    return offers;
  } catch (error) {
    console.error("[boutique] Lecture du catalogue Stripe impossible", error);
    return {};
  }
}

export async function getOffer(slug: string): Promise<Offer | null> {
  return (await getOffers())[slug] ?? null;
}

/** Zones de livraison dont le tarif est configuré, avec leur prix lu dans Stripe. */
export async function getZoneRates(): Promise<ZoneRate[]> {
  const stripe = getStripe();
  if (!stripe) return [];
  const zones = shippingZones.flatMap((z) => {
    const rateId = process.env[z.rateEnv];
    return rateId ? [{ ...z, rateId }] : [];
  });
  return Promise.all(
    zones.map(async (z) => {
      try {
        const rate = await stripe.shippingRates.retrieve(z.rateId);
        const fixed = rate.fixed_amount;
        const price = fixed ? (fixed.amount === 0 ? "Offerte" : formatMoney(fixed.amount, fixed.currency)) : null;
        return { ...z, price };
      } catch (error) {
        console.error(`[boutique] Tarif de livraison ${z.rateId} introuvable`, error);
        return { ...z, price: null };
      }
    }),
  );
}
