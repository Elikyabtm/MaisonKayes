"use server";

import { randomBytes } from "node:crypto";
import { and, asc, count, eq, max, ne } from "drizzle-orm";
import sharp from "sharp";
import { isCategory } from "@/data/categories";
import { DEFAULT_VARIANT } from "@/data/catalog-types";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateProducts } from "@/lib/revalidate";
import { backTo, done, int } from "./util";

const { products, variants, productImages, media, orderItems } = schema;

const KINDS = ["produit", "portee", "detail", "scene"];
const MAX_UPLOAD = 20 * 1024 * 1024;
const MAX_SIDE = 1800;

const text = (fd: FormData, key: string, maxLen = 5000) => String(fd.get(key) ?? "").trim().slice(0, maxLen);

/** « 25 », « 25,5 », « 25.50 » → centimes ; vide → null ; invalide → NaN. */
function parsePrice(raw: string): number | null {
  const s = raw.replace(/\s|€/g, "");
  if (!s) return null;
  if (!/^\d{1,6}([.,]\d{1,2})?$/.test(s)) return NaN;
  return Math.round(Number(s.replace(",", ".")) * 100);
}

function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "piece"
  );
}

async function uniqueSlug(base: string) {
  const db = await getDb();
  let slug = base;
  for (let i = 2; ; i++) {
    const [hit] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (!hit) return slug;
    slug = `${base}-${i}`;
  }
}

/** Échange la position d’un élément avec son voisin dans une liste triée. */
function swap<T extends { sort: number }>(list: T[], index: number, dir: string) {
  const j = dir === "haut" ? index - 1 : index + 1;
  if (index < 0 || j < 0 || j >= list.length) return null;
  return [list[index], list[j]] as const;
}

/* ——— Fiches ——— */

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "nom", 200);
  const category = text(formData, "categorie");
  if (!name) done("/admin/catalogue/nouveau", "erreur", "nom");
  if (!isCategory(category)) done("/admin/catalogue/nouveau", "erreur", "categorie");
  const db = await getDb();
  const id = `mk-${randomBytes(4).toString("hex")}`;
  const [{ last }] = await db.select({ last: max(products.sort) }).from(products);
  // Hors transaction : PGlite n’a qu’une connexion, une requête externe y attendrait indéfiniment.
  const slug = await uniqueSlug(slugify(name));
  await db.transaction(async (tx) => {
    await tx.insert(products).values({
      id,
      slug,
      name,
      category,
      description: text(formData, "description"),
      visible: false,
      sort: (last ?? -1) + 1,
    });
    await tx.insert(variants).values({ productId: id, name: DEFAULT_VARIANT, sort: 0 });
  });
  done(`/admin/catalogue/${id}`, "ok", "creee");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const back = `/admin/catalogue/${id}`;
  const name = text(formData, "nom", 200);
  const category = text(formData, "categorie");
  const price = parsePrice(text(formData, "prix", 20));
  if (!name) done(back, "erreur", "nom");
  if (!isCategory(category)) done(back, "erreur", "categorie");
  if (Number.isNaN(price)) done(back, "erreur", "prix");
  const features = text(formData, "caracteristiques")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);
  const db = await getDb();
  const [p] = await db
    .update(products)
    .set({
      name,
      category,
      description: text(formData, "description"),
      features,
      priceCents: price,
      visible: formData.get("visible") === "on",
      upcycled: formData.get("upcycle") === "on",
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  if (!p) done("/admin/catalogue", "erreur", "introuvable");
  await revalidateProducts([id]);
  done(back, "ok", "fiche");
}

/** Ordre des fiches dans le catalogue (et la sélection de l’accueil). */
export async function moveProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const db = await getDb();
  const list = await db.select({ id: products.id, sort: products.sort }).from(products).orderBy(asc(products.sort), asc(products.name));
  const pair = swap(list, list.findIndex((p) => p.id === id), text(formData, "sens"));
  if (pair) {
    await db.transaction(async (tx) => {
      // Positions normalisées 0..n-1, puis échange.
      for (const [i, p] of list.entries()) await tx.update(products).set({ sort: i }).where(eq(products.id, p.id));
      const a = list.indexOf(pair[0]);
      const b = list.indexOf(pair[1]);
      await tx.update(products).set({ sort: b }).where(eq(products.id, pair[0].id));
      await tx.update(products).set({ sort: a }).where(eq(products.id, pair[1].id));
    });
    await revalidateProducts([]);
  }
  done(backTo(formData, "/admin/catalogue"), "ok", "ordre");
}

/* ——— Variantes ——— */

export async function saveVariants(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const back = `/admin/catalogue/${id}#variantes`;
  const db = await getDb();
  const list = await db.select().from(variants).where(eq(variants.productId, id));
  if (!list.length) done(back, "erreur", "introuvable");
  const updates = list.map((v) => ({
    id: v.id,
    name: text(formData, `nom_${v.id}`, 120) || v.name,
    active: formData.get(`active_${v.id}`) === "on",
  }));
  if (!updates.some((u) => u.active)) done(back, "erreur", "variante_derniere");
  await db.transaction(async (tx) => {
    for (const u of updates) await tx.update(variants).set({ name: u.name, active: u.active }).where(eq(variants.id, u.id));
  });
  await revalidateProducts([id]);
  done(back, "ok", "variante");
}

export async function addVariant(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const back = `/admin/catalogue/${id}#variantes`;
  const name = text(formData, "nom", 120);
  if (!name) done(back, "erreur", "nom");
  const db = await getDb();
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1);
  if (!p) done("/admin/catalogue", "erreur", "introuvable");
  const [{ last }] = await db.select({ last: max(variants.sort) }).from(variants).where(eq(variants.productId, id));
  await db.insert(variants).values({ productId: id, name, sort: (last ?? -1) + 1 });
  await revalidateProducts([id]);
  done(back, "ok", "variante_ajoutee");
}

/** Suppression possible seulement si la variante n’a jamais été vendue ; sinon, la désactiver. */
export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const variantId = int(formData.get("variante"));
  const db = await getDb();
  const [v] = await db.select().from(variants).where(eq(variants.id, variantId)).limit(1);
  if (!v) done("/admin/catalogue", "erreur", "introuvable");
  const back = `/admin/catalogue/${v.productId}#variantes`;
  const [{ n: sold }] = await db.select({ n: count() }).from(orderItems).where(eq(orderItems.variantId, variantId));
  if (sold > 0) done(back, "erreur", "variante_vendue");
  const [{ n: others }] = await db
    .select({ n: count() })
    .from(variants)
    .where(and(eq(variants.productId, v.productId), ne(variants.id, variantId), eq(variants.active, true)));
  if (others === 0) done(back, "erreur", "variante_derniere");
  await db.delete(variants).where(eq(variants.id, variantId));
  await revalidateProducts([v.productId]);
  done(back, "ok", "variante_supprimee");
}

/** Bouton « ↑ / ↓ » : valeur `cmd` au format « <id>:haut » ou « <id>:bas ». */
export async function moveVariant(formData: FormData) {
  await requireAdmin();
  const [rawId, sens] = text(formData, "cmd", 40).split(":");
  const variantId = int(rawId);
  const db = await getDb();
  const [v] = await db.select().from(variants).where(eq(variants.id, variantId)).limit(1);
  if (!v) done("/admin/catalogue", "erreur", "introuvable");
  const list = await db.select().from(variants).where(eq(variants.productId, v.productId)).orderBy(asc(variants.sort), asc(variants.id));
  const pair = swap(list, list.findIndex((x) => x.id === variantId), sens ?? "");
  if (pair) {
    await db.transaction(async (tx) => {
      for (const [i, x] of list.entries()) await tx.update(variants).set({ sort: i }).where(eq(variants.id, x.id));
      await tx.update(variants).set({ sort: list.indexOf(pair[1]) }).where(eq(variants.id, pair[0].id));
      await tx.update(variants).set({ sort: list.indexOf(pair[0]) }).where(eq(variants.id, pair[1].id));
    });
    await revalidateProducts([v.productId]);
  }
  done(`/admin/catalogue/${v.productId}#variantes`, "ok", "ordre");
}

/* ——— Photos ——— */

export async function uploadPhotos(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const back = `/admin/catalogue/${id}#photos`;
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) done(back, "erreur", "photo_vide");
  if (files.some((f) => f.size > MAX_UPLOAD)) done(back, "erreur", "photo_poids");

  const db = await getDb();
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) done("/admin/catalogue", "erreur", "introuvable");

  // Conversion : orientation EXIF appliquée, ≤ 1 800 px, WebP, métadonnées retirées.
  const converted: { data: Buffer; width: number; height: number }[] = [];
  for (const file of files) {
    try {
      const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      converted.push({ data, width: info.width, height: info.height });
    } catch {
      done(back, "erreur", "photo_format");
    }
  }

  const [{ last }] = await db.select({ last: max(productImages.sort) }).from(productImages).where(eq(productImages.productId, id));
  const alt = text(formData, "alt", 300) || p.name;
  await db.transaction(async (tx) => {
    for (const [i, c] of converted.entries()) {
      const mediaId = randomBytes(12).toString("base64url");
      await tx.insert(media).values({ id: mediaId, contentType: "image/webp", data: c.data, width: c.width, height: c.height, bytes: c.data.length });
      await tx.insert(productImages).values({
        productId: id,
        src: `/media/${mediaId}.webp`,
        mediaId,
        width: c.width,
        height: c.height,
        alt: converted.length > 1 ? `${alt} (${i + 1})` : alt,
        kind: "produit",
        sort: (last ?? -1) + 1 + i,
      });
    }
  });
  await revalidateProducts([id]);
  done(back, "ok", "photos");
}

export async function updatePhoto(formData: FormData) {
  await requireAdmin();
  const imageId = int(formData.get("photo"));
  const kind = text(formData, "type");
  const db = await getDb();
  const [img] = await db
    .update(productImages)
    .set({ alt: text(formData, "alt", 300), ...(KINDS.includes(kind) && { kind }) })
    .where(eq(productImages.id, imageId))
    .returning();
  if (!img) done("/admin/catalogue", "erreur", "introuvable");
  await revalidateProducts([img.productId]);
  done(`/admin/catalogue/${img.productId}#photo-${img.id}`, "ok", "photo");
}

export async function movePhoto(formData: FormData) {
  await requireAdmin();
  const imageId = int(formData.get("photo"));
  const db = await getDb();
  const [img] = await db.select().from(productImages).where(eq(productImages.id, imageId)).limit(1);
  if (!img) done("/admin/catalogue", "erreur", "introuvable");
  const list = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, img.productId))
    .orderBy(asc(productImages.sort), asc(productImages.id));
  const pair = swap(list, list.findIndex((x) => x.id === imageId), text(formData, "sens"));
  if (pair) {
    await db.transaction(async (tx) => {
      for (const [i, x] of list.entries()) await tx.update(productImages).set({ sort: i }).where(eq(productImages.id, x.id));
      await tx.update(productImages).set({ sort: list.indexOf(pair[1]) }).where(eq(productImages.id, pair[0].id));
      await tx.update(productImages).set({ sort: list.indexOf(pair[0]) }).where(eq(productImages.id, pair[1].id));
    });
    await revalidateProducts([img.productId]);
  }
  done(`/admin/catalogue/${img.productId}#photo-${img.id}`, "ok", "ordre");
}

export async function deletePhoto(formData: FormData) {
  await requireAdmin();
  const imageId = int(formData.get("photo"));
  const db = await getDb();
  const [img] = await db.delete(productImages).where(eq(productImages.id, imageId)).returning();
  if (!img) done("/admin/catalogue", "erreur", "introuvable");
  if (img.mediaId) {
    const [{ n }] = await db.select({ n: count() }).from(productImages).where(eq(productImages.mediaId, img.mediaId));
    if (n === 0) await db.delete(media).where(eq(media.id, img.mediaId));
  }
  await revalidateProducts([img.productId]);
  done(`/admin/catalogue/${img.productId}#photos`, "ok", "photo_supprimee");
}
