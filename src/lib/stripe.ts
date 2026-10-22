import "server-only";
import Stripe from "stripe";

let client: Stripe | null | undefined;

/**
 * Client Stripe côté serveur, ou `null` si la clé secrète n’est pas configurée
 * (la boutique bascule alors sur l’invitation à contacter la marque).
 */
export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return (client = null);

  // STRIPE_API_BASE permet de viser un serveur de test local (ex. stripe-mock). Jamais en production.
  const base = process.env.STRIPE_API_BASE ? new URL(process.env.STRIPE_API_BASE) : null;
  client = new Stripe(key, {
    appInfo: { name: "Maison Kayes" },
    ...(base && {
      host: base.hostname,
      port: base.port || (base.protocol === "https:" ? 443 : 80),
      protocol: base.protocol.replace(":", "") as "http" | "https",
    }),
  });
  return client;
}
