import "server-only";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb, schema } from "@/db";
import type { Customer } from "./session";

/**
 * Client Stripe correspondant au compte (créé à la première commande, mis à jour ensuite) :
 * il permet à Stripe Checkout de pré-remplir l’e-mail et l’adresse de livraison enregistrée.
 * Renvoie `null` en cas d’échec : la commande reste possible, avec l’e-mail seul pré-rempli.
 */
export async function syncStripeCustomer(stripe: Stripe, customer: Customer): Promise<string | null> {
  const a = customer.shippingAddress;
  const shipping = a?.line1
    ? {
        name: a.name || customer.name,
        phone: customer.phone ?? undefined,
        address: {
          line1: a.line1,
          line2: a.line2 ?? undefined,
          postal_code: a.postalCode ?? undefined,
          city: a.city ?? undefined,
          country: a.country ?? undefined,
        },
      }
    : undefined;
  const data = { email: customer.email, name: customer.name, phone: customer.phone ?? undefined, ...(shipping && { shipping }) };
  try {
    if (customer.stripeCustomerId) {
      await stripe.customers.update(customer.stripeCustomerId, data);
      return customer.stripeCustomerId;
    }
    const created = await stripe.customers.create(
      { ...data, metadata: { compte: String(customer.id) } },
      { idempotencyKey: `mk-client-${customer.id}` },
    );
    const db = await getDb();
    await db.update(schema.customers).set({ stripeCustomerId: created.id }).where(eq(schema.customers.id, customer.id));
    return created.id;
  } catch (error) {
    console.error(`[compte] Client Stripe du compte ${customer.id} indisponible`, error);
    return null;
  }
}
