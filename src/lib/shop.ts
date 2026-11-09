import "server-only";
import { shippingZones, type ShippingZone } from "@/data/shipping";
import { formatMoney } from "./money";
import { getStripe } from "./stripe";

export { formatMoney };

export type ZoneRate = ShippingZone & { rateId: string; price: string | null };

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

/** La vente en ligne est possible : Stripe configuré et au moins une zone de livraison. */
export async function shopIsOpen(): Promise<boolean> {
  return Boolean(getStripe()) && shippingZones.some((z) => Boolean(process.env[z.rateEnv]));
}
