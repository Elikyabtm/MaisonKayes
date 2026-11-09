import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, schema } from "@/db";
import type { CustomerTokenPurpose } from "@/db/schema";

/** Cookie distinct de celui des administrateurs : un compte client n’ouvre jamais le dashboard. */
export const CUSTOMER_COOKIE = "mk_client";
const SESSION_DAYS = 30;
export const MIN_CUSTOMER_PASSWORD = 10;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" && process.env.ADMIN_COOKIE_INSECURE !== "1",
  sameSite: "lax" as const,
  path: "/",
  expires,
});

export async function createCustomerSession(customerId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = await getDb();
  await db.insert(schema.customerSessions).values({ tokenHash: hashToken(token), customerId, expiresAt });
  await db.update(schema.customers).set({ lastLoginAt: new Date() }).where(eq(schema.customers.id, customerId));
  await db.delete(schema.customerSessions).where(lt(schema.customerSessions.expiresAt, new Date()));
  (await cookies()).set(CUSTOMER_COOKIE, token, cookieOptions(expiresAt));
}

export type Customer = typeof schema.customers.$inferSelect;

/** Client connecté, ou `null`. Mis en cache le temps d’une requête. */
export const getCurrentCustomer = cache(async (): Promise<Customer | null> => {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ c: schema.customers })
    .from(schema.customerSessions)
    .innerJoin(schema.customers, eq(schema.customers.id, schema.customerSessions.customerId))
    .where(and(eq(schema.customerSessions.tokenHash, hashToken(token)), gt(schema.customerSessions.expiresAt, new Date())))
    .limit(1);
  return row?.c ?? null;
});

/** Garde d’accès de l’espace client : à appeler sur chaque page et action de /compte. */
export async function requireCustomer(next = "/compte"): Promise<Customer> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/compte/connexion?suite=${encodeURIComponent(next)}`);
  return customer;
}

export async function destroyCustomerSession() {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.customerSessions).where(eq(schema.customerSessions.tokenHash, hashToken(token)));
  }
  store.delete(CUSTOMER_COOKIE);
}

/** Ferme toutes les sessions d’un client (changement de mot de passe, réinitialisation). */
export async function destroyAllCustomerSessions(customerId: number) {
  const db = await getDb();
  await db.delete(schema.customerSessions).where(eq(schema.customerSessions.customerId, customerId));
}

/* ——— Jetons envoyés par e-mail ——— */

const TOKEN_TTL: Record<CustomerTokenPurpose, number> = {
  verification: 48 * 60 * 60 * 1000,
  reinitialisation: 60 * 60 * 1000,
};

/** Crée un jeton à usage unique (les jetons précédents du même type sont invalidés). */
export async function issueToken(customerId: number, purpose: CustomerTokenPurpose) {
  const db = await getDb();
  await db
    .delete(schema.customerTokens)
    .where(and(eq(schema.customerTokens.customerId, customerId), eq(schema.customerTokens.purpose, purpose)));
  const token = randomBytes(32).toString("base64url");
  await db.insert(schema.customerTokens).values({
    tokenHash: hashToken(token),
    customerId,
    purpose,
    expiresAt: new Date(Date.now() + TOKEN_TTL[purpose]),
  });
  return token;
}

/** Consomme un jeton valide et renvoie l’identifiant du client, ou `null`. */
export async function consumeToken(token: string, purpose: CustomerTokenPurpose): Promise<number | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const db = await getDb();
  const [row] = await db
    .update(schema.customerTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(schema.customerTokens.tokenHash, hashToken(token)),
        eq(schema.customerTokens.purpose, purpose),
        isNull(schema.customerTokens.usedAt),
        gt(schema.customerTokens.expiresAt, new Date()),
      ),
    )
    .returning();
  return row?.customerId ?? null;
}
