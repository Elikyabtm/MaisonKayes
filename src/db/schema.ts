import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer | Uint8Array }>({
  dataType: () => "bytea",
  fromDriver: (v) => (Buffer.isBuffer(v) ? v : Buffer.from(v)),
});

const now = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/* ——— Catalogue ——— */

export const products = pgTable(
  "products",
  {
    id: text().primaryKey(),
    /** Fixe après création : l’URL publique est /creations/<slug>. */
    slug: text().notNull().unique(),
    name: text().notNull(),
    category: text().notNull(),
    description: text().notNull().default(""),
    features: jsonb().$type<string[]>().notNull().default([]),
    /** Prix en centimes, `null` = prix non renseigné (pièce non commandable). */
    priceCents: integer(),
    currency: text().notNull().default("eur"),
    visible: boolean().notNull().default(true),
    upcycled: boolean().notNull().default(false),
    sort: integer().notNull().default(0),
    createdAt: now(),
    updatedAt: now(),
  },
  (t) => [index("products_category_idx").on(t.category)],
);

/** Photos importées depuis le dashboard, stockées en base (WebP optimisé). */
export const media = pgTable("media", {
  id: text().primaryKey(),
  contentType: text().notNull(),
  data: bytea().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  bytes: integer().notNull(),
  createdAt: now(),
});

export const productImages = pgTable(
  "product_images",
  {
    id: serial().primaryKey(),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** `/images/…` (fichier du site) ou `/media/<id>.webp` (photo importée). */
    src: text().notNull(),
    mediaId: text().references(() => media.id, { onDelete: "set null" }),
    width: integer().notNull(),
    height: integer().notNull(),
    alt: text().notNull().default(""),
    kind: text().notNull().default("produit"),
    /** Cadrage CSS `object-position` pour les vignettes recadrées. */
    position: text(),
    sort: integer().notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId, t.sort)],
);

export const variants = pgTable(
  "variants",
  {
    id: serial().primaryKey(),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** « Unique » pour une pièce sans déclinaison (non affiché sur le site). */
    name: text().notNull(),
    /** Quantité disponible ; `null` = stock à renseigner (non commandable). */
    stock: integer(),
    lowStockThreshold: integer().notNull().default(1),
    active: boolean().notNull().default(true),
    sort: integer().notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId, t.sort)],
);

/* ——— Comptes administrateurs ——— */

export const adminUsers = pgTable("admin_users", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  name: text().notNull(),
  passwordHash: text().notNull(),
  active: boolean().notNull().default(true),
  createdAt: now(),
  lastLoginAt: timestamp({ withTimezone: true }),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    /** Empreinte SHA-256 du jeton (le jeton brut n’existe que dans le cookie). */
    tokenHash: text().primaryKey(),
    userId: integer()
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: now(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId)],
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial().primaryKey(),
    email: text().notNull(),
    ip: text().notNull(),
    success: boolean().notNull(),
    createdAt: now(),
  },
  (t) => [index("login_attempts_lookup_idx").on(t.email, t.createdAt), index("login_attempts_ip_idx").on(t.ip, t.createdAt)],
);

/* ——— Commandes ——— */

export const paymentStatuses = ["en_attente", "paye", "echoue", "rembourse", "partiellement_rembourse"] as const;
export const fulfillmentStatuses = ["a_preparer", "expediee", "remise", "annulee"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];
export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];

export type PostalAddress = {
  line1: string | null;
  line2: string | null;
  postalCode: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

export const orders = pgTable(
  "orders",
  {
    id: serial().primaryKey(),
    reference: text().unique(),
    stripeSessionId: text().notNull().unique(),
    stripePaymentIntentId: text(),
    customerName: text(),
    customerEmail: text(),
    customerPhone: text(),
    shippingName: text(),
    shippingAddress: jsonb().$type<PostalAddress>(),
    shippingZone: text(),
    shippingLabel: text(),
    subtotalCents: integer().notNull().default(0),
    shippingCents: integer().notNull().default(0),
    totalCents: integer().notNull().default(0),
    refundedCents: integer().notNull().default(0),
    currency: text().notNull().default("eur"),
    paymentStatus: text().$type<PaymentStatus>().notNull().default("en_attente"),
    fulfillmentStatus: text().$type<FulfillmentStatus>().notNull().default("a_preparer"),
    carrier: text(),
    trackingNumber: text(),
    note: text(),
    /** Stock déjà retiré pour cette commande (évite un double décrément). */
    stockApplied: boolean().notNull().default(false),
    createdAt: now(),
    updatedAt: now(),
    shippedAt: timestamp({ withTimezone: true }),
    deliveredAt: timestamp({ withTimezone: true }),
    cancelledAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index("orders_created_idx").on(t.createdAt),
    index("orders_fulfillment_idx").on(t.fulfillmentStatus),
    index("orders_payment_intent_idx").on(t.stripePaymentIntentId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial().primaryKey(),
    orderId: integer()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text().references(() => products.id, { onDelete: "set null" }),
    variantId: integer().references(() => variants.id, { onDelete: "set null" }),
    /** Copies au moment de la commande : la fiche peut changer ensuite. */
    productName: text().notNull(),
    variantName: text(),
    unitCents: integer().notNull(),
    quantity: integer().notNull(),
    totalCents: integer().notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/* ——— Mouvements de stock ——— */

export const stockReasons = {
  reception: "Réception / fabrication",
  correction: "Correction d’inventaire",
  vente: "Vente en ligne",
  annulation: "Commande annulée",
  retour: "Retour client",
  perte: "Perte / défaut",
  autre: "Autre",
} as const;
export type StockReason = keyof typeof stockReasons;

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: serial().primaryKey(),
    variantId: integer()
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    /** Variation appliquée (positive ou négative). */
    delta: integer().notNull(),
    /** Stock avant le mouvement (`null` si le stock était à renseigner). */
    stockBefore: integer(),
    stockAfter: integer().notNull(),
    reason: text().$type<StockReason>().notNull(),
    note: text(),
    orderId: integer().references(() => orders.id, { onDelete: "set null" }),
    adminUserId: integer().references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: now(),
  },
  (t) => [index("stock_movements_variant_idx").on(t.variantId, t.createdAt)],
);

