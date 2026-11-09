import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, schema } from "@/db";

export const SESSION_COOKIE = "mk_admin";
const SESSION_DAYS = 7;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  // En production, cookie réservé au https (ADMIN_COOKIE_INSECURE=1 pour un test local en http).
  secure: process.env.NODE_ENV === "production" && process.env.ADMIN_COOKIE_INSECURE !== "1",
  sameSite: "lax" as const,
  path: "/",
  expires,
});

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = await getDb();
  await db.insert(schema.adminSessions).values({ tokenHash: hashToken(token), userId, expiresAt });
  await db.update(schema.adminUsers).set({ lastLoginAt: new Date() }).where(eq(schema.adminUsers.id, userId));
  // Ménage des sessions expirées.
  await db.delete(schema.adminSessions).where(lt(schema.adminSessions.expiresAt, new Date()));
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export type Admin = { id: number; email: string; name: string };

/** Administrateur connecté (session valide et compte actif), ou `null`. Mis en cache le temps d’une requête. */
export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.adminSessions.userId))
    .where(
      and(
        eq(schema.adminSessions.tokenHash, hashToken(token)),
        gt(schema.adminSessions.expiresAt, new Date()),
        eq(schema.adminUsers.active, true),
      ),
    )
    .limit(1);
  return row ?? null;
});

/**
 * Garde d’accès : à appeler en tête de CHAQUE page et action serveur du dashboard.
 * Redirige vers la connexion si la session est absente, expirée ou si le compte est désactivé.
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/connexion");
  return admin;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.adminSessions).where(eq(schema.adminSessions.tokenHash, hashToken(token)));
  }
  store.delete(SESSION_COOKIE);
}
