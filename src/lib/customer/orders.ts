import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";

/** Commandes rattachées à un compte (jamais par simple correspondance d’e-mail non confirmé). */
export async function getCustomerOrders(customerId: number) {
  const db = await getDb();
  const rows = await db.select().from(schema.orders).where(eq(schema.orders.customerId, customerId)).orderBy(desc(schema.orders.createdAt));
  if (!rows.length) return [];
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(
      inArray(
        schema.orderItems.orderId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(schema.orderItems.id));
  return rows.map((r) => ({ ...r, items: items.filter((i) => i.orderId === r.id) }));
}
