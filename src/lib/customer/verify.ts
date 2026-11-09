import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

/**
 * Adresse confirmée : rattache au compte les commandes passées sans compte avec cette adresse.
 * Volontairement hors d’un module « use server » : ce n’est pas une action appelable depuis le navigateur.
 */
export async function markVerified(customerId: number, email: string) {
  const db = await getDb();
  await db.update(schema.customers).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(schema.customers.id, customerId));
  await db
    .update(schema.orders)
    .set({ customerId })
    .where(and(sql`lower(${schema.orders.customerEmail}) = ${email}`, sql`${schema.orders.customerId} is null`));
}
