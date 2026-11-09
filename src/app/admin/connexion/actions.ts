"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;

export type LoginState = { error?: string; email?: string };

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Renseignez votre e-mail et votre mot de passe.", email };

  const db = await getDb();
  const ip = await clientIp();
  const since = new Date(Date.now() - WINDOW_MS);
  const failures = (where: ReturnType<typeof eq>) =>
    db
      .select({ n: count() })
      .from(schema.loginAttempts)
      .where(and(where, eq(schema.loginAttempts.success, false), gt(schema.loginAttempts.createdAt, since)));
  const [[byEmail], [byIp]] = await Promise.all([
    failures(eq(schema.loginAttempts.email, email)),
    failures(eq(schema.loginAttempts.ip, ip)),
  ]);
  if (byEmail.n >= MAX_PER_EMAIL || byIp.n >= MAX_PER_IP) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes.", email };
  }

  const [user] = await db
    .select()
    .from(schema.adminUsers)
    .where(and(eq(schema.adminUsers.email, email), eq(schema.adminUsers.active, true)))
    .limit(1);
  // Vérification toujours effectuée, même pour un e-mail inconnu (temps de réponse constant).
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  await db.insert(schema.loginAttempts).values({ email, ip, success: Boolean(user && ok) });
  if (!user || !ok) return { error: "E-mail ou mot de passe incorrect.", email };

  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/connexion");
}
