import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, or, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { fulfillmentStatuses, paymentStatuses, type FulfillmentStatus, type PaymentStatus } from "@/db/schema";
import { stockLevel, type StockLevel } from "./labels";

const { orders, orderItems, orderEmails, products, variants, productImages, stockMovements, adminUsers } = schema;

export const PAGE_SIZE = 30;

/* ——— Vue d’ensemble ——— */

export async function getOverview() {
  const db = await getDb();
  const statusCounts = await db
    .select({ status: orders.fulfillmentStatus, payment: orders.paymentStatus, n: count() })
    .from(orders)
    .groupBy(orders.fulfillmentStatus, orders.paymentStatus);
  const sum = (f: (r: (typeof statusCounts)[number]) => boolean) => statusCounts.filter(f).reduce((n, r) => n + r.n, 0);

  const toPrepare = await db
    .select()
    .from(orders)
    .where(and(eq(orders.fulfillmentStatus, "a_preparer"), eq(orders.paymentStatus, "paye")))
    .orderBy(asc(orders.createdAt))
    .limit(8);

  const [{ n: failedEmails }] = await db.select({ n: count() }).from(orderEmails).where(eq(orderEmails.status, "echec"));
  const stock = await listStock();
  const flat = stock.flatMap((p) => p.variants.map((v) => ({ ...v, product: p })));

  return {
    counts: {
      toPrepare: sum((r) => r.status === "a_preparer" && r.payment === "paye"),
      awaitingPayment: sum((r) => r.status === "a_preparer" && r.payment === "en_attente"),
      shipped: sum((r) => r.status === "expediee"),
      delivered: sum((r) => r.status === "remise"),
    },
    failedEmails,
    toPrepare: await withItems(toPrepare),
    lowStock: flat.filter((v) => v.level === "bas"),
    outOfStock: flat.filter((v) => v.level === "rupture"),
    unknownStock: flat.filter((v) => v.level === "inconnu"),
  };
}

/* ——— Commandes ——— */

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;

async function withItems<T extends OrderRow>(rows: T[]) {
  if (!rows.length) return [] as (T & { items: OrderItemRow[]; emailFailures: number })[];
  const db = await getDb();
  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(orderItems.id));
  const failed = await db
    .select({ orderId: orderEmails.orderId })
    .from(orderEmails)
    .where(
      and(
        eq(orderEmails.status, "echec"),
        inArray(
          orderEmails.orderId,
          rows.map((r) => r.id),
        ),
      ),
    );
  return rows.map((r) => ({
    ...r,
    items: items.filter((i) => i.orderId === r.id),
    emailFailures: failed.filter((f) => f.orderId === r.id).length,
  }));
}

export type OrderFilters = { q?: string; statut?: string; paiement?: string; email?: string; page?: number };

export async function listOrders(filters: OrderFilters) {
  const db = await getDb();
  const where: SQL[] = [];
  const q = filters.q?.trim();
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    // Recherche aussi dans les articles commandés.
    const byItem = db.select({ id: orderItems.orderId }).from(orderItems).where(ilike(orderItems.productName, like));
    where.push(
      or(
        ilike(orders.reference, like),
        ilike(orders.customerName, like),
        ilike(orders.customerEmail, like),
        ilike(orders.shippingName, like),
        ilike(orders.trackingNumber, like),
        inArray(orders.id, byItem),
      )!,
    );
  }
  if (filters.statut && (fulfillmentStatuses as readonly string[]).includes(filters.statut)) {
    where.push(eq(orders.fulfillmentStatus, filters.statut as FulfillmentStatus));
  }
  if (filters.paiement && (paymentStatuses as readonly string[]).includes(filters.paiement)) {
    where.push(eq(orders.paymentStatus, filters.paiement as PaymentStatus));
  }
  if (filters.email === "echec") {
    where.push(inArray(orders.id, db.select({ id: orderEmails.orderId }).from(orderEmails).where(eq(orderEmails.status, "echec"))));
  }
  const page = Math.max(1, filters.page ?? 1);
  const cond = where.length ? and(...where) : undefined;
  const [rows, [{ n }]] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(cond)
      .orderBy(desc(orders.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(orders).where(cond),
  ]);
  return { orders: await withItems(rows), total: n, page, pages: Math.max(1, Math.ceil(n / PAGE_SIZE)) };
}

export async function getOrder(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!row) return null;
  const [withLines] = await withItems([row]);
  const movements = await db
    .select({ m: stockMovements, variantName: variants.name, productName: products.name })
    .from(stockMovements)
    .innerJoin(variants, eq(variants.id, stockMovements.variantId))
    .innerJoin(products, eq(products.id, variants.productId))
    .where(eq(stockMovements.orderId, id))
    .orderBy(asc(stockMovements.createdAt));
  const checkedAt = Date.now();
  const emails = (await db.select().from(orderEmails).where(eq(orderEmails.orderId, id)).orderBy(asc(orderEmails.id))).map((e) => ({
    ...e,
    // Envoi resté « en cours » plus de 10 minutes (processus interrompu) : relance possible.
    stale: e.status === "en_cours" && checkedAt - e.updatedAt.getTime() > 10 * 60 * 1000,
  }));
  return { ...withLines, movements, emails };
}

/* ——— Stocks ——— */

export type StockVariant = {
  id: number;
  name: string;
  stock: number | null;
  lowStockThreshold: number;
  active: boolean;
  level: StockLevel;
};

export type StockProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  visible: boolean;
  thumb: string | null;
  variants: StockVariant[];
};

/** Produits (masqués compris) et leurs variantes actives, avec le niveau de stock. */
export async function listStock(): Promise<StockProduct[]> {
  const db = await getDb();
  const [ps, vs, thumbs] = await Promise.all([
    db.select().from(products).orderBy(asc(products.sort), asc(products.name)),
    db.select().from(variants).where(eq(variants.active, true)).orderBy(asc(variants.sort), asc(variants.id)),
    db
      .selectDistinctOn([productImages.productId], { productId: productImages.productId, src: productImages.src })
      .from(productImages)
      .orderBy(productImages.productId, asc(productImages.sort), asc(productImages.id)),
  ]);
  return ps.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    visible: p.visible,
    thumb: thumbs.find((t) => t.productId === p.id)?.src ?? null,
    variants: vs
      .filter((v) => v.productId === p.id)
      .map((v) => ({
        id: v.id,
        name: v.name,
        stock: v.stock,
        lowStockThreshold: v.lowStockThreshold,
        active: v.active,
        level: stockLevel(v.stock, v.lowStockThreshold),
      })),
  }));
}

export async function recentMovements(variantIds: number[], perVariant = 3) {
  if (!variantIds.length) return new Map<number, MovementRow[]>();
  const db = await getDb();
  const rows = await db
    .select({ m: stockMovements, admin: adminUsers.name })
    .from(stockMovements)
    .leftJoin(adminUsers, eq(adminUsers.id, stockMovements.adminUserId))
    .where(inArray(stockMovements.variantId, variantIds))
    .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id));
  const map = new Map<number, MovementRow[]>();
  for (const r of rows) {
    const list = map.get(r.m.variantId) ?? [];
    if (list.length < perVariant) list.push({ ...r.m, adminName: r.admin });
    map.set(r.m.variantId, list);
  }
  return map;
}

export type MovementRow = typeof stockMovements.$inferSelect & { adminName: string | null };

export async function listMovements(filters: { variante?: number; page?: number }) {
  const db = await getDb();
  const page = Math.max(1, filters.page ?? 1);
  const cond = filters.variante ? eq(stockMovements.variantId, filters.variante) : undefined;
  const [rows, [{ n }]] = await Promise.all([
    db
      .select({
        m: stockMovements,
        admin: adminUsers.name,
        variantName: variants.name,
        productName: products.name,
        productId: products.id,
        orderRef: orders.reference,
      })
      .from(stockMovements)
      .innerJoin(variants, eq(variants.id, stockMovements.variantId))
      .innerJoin(products, eq(products.id, variants.productId))
      .leftJoin(adminUsers, eq(adminUsers.id, stockMovements.adminUserId))
      .leftJoin(orders, eq(orders.id, stockMovements.orderId))
      .where(cond)
      .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
      .limit(50)
      .offset((page - 1) * 50),
    db.select({ n: count() }).from(stockMovements).where(cond),
  ]);
  return { rows, total: n, page, pages: Math.max(1, Math.ceil(n / 50)) };
}

/* ——— Catalogue ——— */

export async function listProductsAdmin() {
  const stock = await listStock();
  const db = await getDb();
  const prices = await db.select({ id: products.id, priceCents: products.priceCents, currency: products.currency }).from(products);
  return stock.map((p) => ({ ...p, ...prices.find((x) => x.id === p.id)! }));
}

export async function getProductAdmin(id: string) {
  const db = await getDb();
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) return null;
  const [imgs, vars, sold] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sort), asc(productImages.id)),
    db.select().from(variants).where(eq(variants.productId, id)).orderBy(asc(variants.sort), asc(variants.id)),
    db
      .select({ variantId: orderItems.variantId, n: count() })
      .from(orderItems)
      .where(and(isNotNull(orderItems.variantId), eq(orderItems.productId, id)))
      .groupBy(orderItems.variantId),
  ]);
  return {
    ...p,
    images: imgs,
    variants: vars.map((v) => ({ ...v, sold: sold.find((s) => s.variantId === v.id)?.n ?? 0 })),
  };
}
