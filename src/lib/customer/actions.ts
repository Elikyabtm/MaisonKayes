"use server";

import { and, count, desc, eq, gt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { shippingZones } from "@/data/shipping";
import { site } from "@/data/site";
import { getDb, schema } from "@/db";
import { DUMMY_HASH, hashPassword, verifyPassword } from "@/lib/auth/password";
import { sendEmail } from "@/lib/email/resend";
import { passwordResetEmail, verificationEmail } from "@/lib/email/templates";
import {
  consumeToken,
  createCustomerSession,
  destroyAllCustomerSessions,
  destroyCustomerSession,
  issueToken,
  MIN_CUSTOMER_PASSWORD,
  requireCustomer,
} from "./session";
import { markVerified } from "./verify";

const { customers, customerTokens, loginAttempts } = schema;

export type FormState = { error?: string; ok?: string; values?: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
}

/** Limitation : `max` tentatives par clé sur `minutes` (journal partagé avec l’admin, clés préfixées). */
async function tooMany(key: string, ip: string, max: number, ipMax: number, minutes = 15) {
  const db = await getDb();
  const since = new Date(Date.now() - minutes * 60 * 1000);
  const [[byKey], [byIp]] = await Promise.all([
    db.select({ n: count() }).from(loginAttempts).where(and(eq(loginAttempts.email, key), eq(loginAttempts.success, false), gt(loginAttempts.createdAt, since))),
    db
      .select({ n: count() })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.ip, ip), eq(loginAttempts.success, false), gt(loginAttempts.createdAt, since), sql`${loginAttempts.email} like 'client:%'`)),
  ]);
  return byKey.n >= max || byIp.n >= ipMax;
}

async function logAttempt(key: string, ip: string, success: boolean) {
  const db = await getDb();
  await db.insert(loginAttempts).values({ email: key, ip, success });
}

/** Chemin de retour interne uniquement (pas de redirection ouverte). */
const safeNext = (raw: string) => (raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/admin") ? raw : "/compte");

async function sendVerification(customer: { id: number; name: string; email: string }) {
  const token = await issueToken(customer.id, "verification");
  const url = `${site.url}/compte/verifier?jeton=${token}`;
  try {
    await sendEmail({ to: customer.email, ...verificationEmail(customer.name, url), idempotencyKey: `mk-verification-${customer.id}-${token.slice(0, 12)}` });
    return true;
  } catch (error) {
    console.error(`[compte] Envoi de la confirmation à ${customer.email} impossible`, error);
    return false;
  }
}

/* ——— Inscription / connexion ——— */

export async function signup(_prev: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "nom", 120);
  const email = str(fd, "email", 200).toLowerCase();
  const password = String(fd.get("mot_de_passe") ?? "");
  const newsletter = fd.get("newsletter") === "on";
  const values = { nom: name, email };
  if (!name) return { error: "Indiquez votre nom.", values };
  if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide.", values };
  if (password.length < MIN_CUSTOMER_PASSWORD) return { error: `Le mot de passe doit contenir au moins ${MIN_CUSTOMER_PASSWORD} caractères.`, values };
  if (password.length > 200) return { error: "Mot de passe trop long.", values };

  const ip = await clientIp();
  if (await tooMany(`client:inscription:${ip}`, ip, 10, 30, 60)) return { error: "Trop de tentatives. Réessayez dans une heure.", values };

  const db = await getDb();
  const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1);
  if (existing) {
    await logAttempt(`client:inscription:${ip}`, ip, false);
    return { error: "Un compte existe déjà avec cette adresse. Connectez-vous ou utilisez « Mot de passe oublié ».", values };
  }
  const [customer] = await db
    .insert(customers)
    .values({ name, email, passwordHash: await hashPassword(password), newsletter, newsletterUpdatedAt: newsletter ? new Date() : null })
    .onConflictDoNothing({ target: customers.email })
    .returning();
  if (!customer) return { error: "Un compte existe déjà avec cette adresse.", values };

  await createCustomerSession(customer.id);
  const sent = await sendVerification(customer);
  redirect(`/compte?ok=${sent ? "bienvenue" : "bienvenue_sans_email"}`);
}

export async function customerLogin(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email", 200).toLowerCase();
  const password = String(fd.get("mot_de_passe") ?? "");
  const next = safeNext(str(fd, "suite", 300));
  const values = { email };
  if (!email || !password) return { error: "Renseignez votre e-mail et votre mot de passe.", values };
  const ip = await clientIp();
  const key = `client:${email}`;
  if (await tooMany(key, ip, 5, 30)) return { error: "Trop de tentatives. Réessayez dans 15 minutes.", values };

  const db = await getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  const valid = await verifyPassword(password, customer?.passwordHash ?? DUMMY_HASH);
  await logAttempt(key, ip, Boolean(customer && valid));
  if (!customer || !valid) return { error: "E-mail ou mot de passe incorrect.", values };
  await createCustomerSession(customer.id);
  redirect(next);
}

export async function customerLogout() {
  await destroyCustomerSession();
  redirect("/compte/connexion?ok=deconnecte");
}

/* ——— Mot de passe oublié ——— */

export async function requestPasswordReset(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email", 200).toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide.", values: { email } };
  const ip = await clientIp();
  const key = `client:reinitialisation:${email}`;
  const neutral = { ok: "Si un compte existe avec cette adresse, un e-mail vient de vous être envoyé. Pensez à vérifier vos courriers indésirables." };
  if (await tooMany(key, ip, 3, 20, 60)) return neutral;
  await logAttempt(key, ip, false); // compte comme tentative, pour limiter les envois

  const db = await getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  if (customer) {
    const token = await issueToken(customer.id, "reinitialisation");
    try {
      await sendEmail({
        to: customer.email,
        ...passwordResetEmail(`${site.url}/compte/reinitialiser?jeton=${token}`),
        idempotencyKey: `mk-reinitialisation-${customer.id}-${token.slice(0, 12)}`,
      });
    } catch (error) {
      console.error(`[compte] Envoi de la réinitialisation à ${email} impossible`, error);
    }
  }
  // Même réponse que le compte existe ou non.
  return neutral;
}

export async function resetPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = str(fd, "jeton", 200);
  const password = String(fd.get("mot_de_passe") ?? "");
  if (password.length < MIN_CUSTOMER_PASSWORD) return { error: `Le mot de passe doit contenir au moins ${MIN_CUSTOMER_PASSWORD} caractères.` };
  if (password.length > 200) return { error: "Mot de passe trop long." };
  const customerId = await consumeToken(token, "reinitialisation");
  if (!customerId) return { error: "Ce lien a expiré ou a déjà été utilisé. Faites une nouvelle demande." };
  const db = await getDb();
  // Le lien prouve la possession de l’adresse : elle est confirmée au passage.
  const [c] = await db
    .update(customers)
    .set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
    .where(eq(customers.id, customerId))
    .returning();
  if (!c.emailVerifiedAt) await markVerified(c.id, c.email);
  await destroyAllCustomerSessions(customerId);
  await createCustomerSession(customerId);
  redirect("/compte?ok=mot_de_passe");
}

/* ——— Espace client ——— */

export async function resendVerification() {
  const customer = await requireCustomer();
  if (customer.emailVerifiedAt) redirect("/compte");
  const db = await getDb();
  const [last] = await db
    .select({ createdAt: customerTokens.createdAt })
    .from(customerTokens)
    .where(and(eq(customerTokens.customerId, customer.id), eq(customerTokens.purpose, "verification")))
    .orderBy(desc(customerTokens.createdAt))
    .limit(1);
  if (last && Date.now() - last.createdAt.getTime() < 2 * 60 * 1000) redirect("/compte?erreur=patience");
  const sent = await sendVerification(customer);
  redirect(`/compte?${sent ? "ok=verification_envoyee" : "erreur=email_indisponible"}`);
}

export async function updateProfile(fd: FormData) {
  const customer = await requireCustomer();
  const name = str(fd, "nom", 120);
  const phone = str(fd, "telephone", 40);
  if (!name) redirect("/compte?erreur=nom#profil");
  if (phone && !/^[+\d][\d\s().-]{5,}$/.test(phone)) redirect("/compte?erreur=telephone#profil");
  const db = await getDb();
  await db.update(customers).set({ name, phone: phone || null, updatedAt: new Date() }).where(eq(customers.id, customer.id));
  redirect("/compte?ok=profil#profil");
}

const allowedCountries = new Set(shippingZones.flatMap((z) => z.countries));

export async function updateAddress(fd: FormData) {
  const customer = await requireCustomer();
  if (fd.get("effacer") === "1") {
    const db = await getDb();
    await db.update(customers).set({ shippingAddress: null, updatedAt: new Date() }).where(eq(customers.id, customer.id));
    redirect("/compte?ok=adresse_effacee#adresse");
  }
  const address = {
    name: str(fd, "destinataire", 120) || customer.name,
    line1: str(fd, "adresse", 200),
    line2: str(fd, "complement", 200) || null,
    postalCode: str(fd, "code_postal", 20),
    city: str(fd, "ville", 120),
    state: null,
    country: str(fd, "pays", 2).toUpperCase(),
  };
  if (!address.line1 || !address.postalCode || !address.city) redirect("/compte?erreur=adresse#adresse");
  if (!allowedCountries.has(address.country)) redirect("/compte?erreur=pays#adresse");
  const db = await getDb();
  await db.update(customers).set({ shippingAddress: address, updatedAt: new Date() }).where(eq(customers.id, customer.id));
  redirect("/compte?ok=adresse#adresse");
}

export async function updateNewsletter(fd: FormData) {
  const customer = await requireCustomer();
  const on = fd.get("newsletter") === "on";
  if (on !== customer.newsletter) {
    const db = await getDb();
    await db.update(customers).set({ newsletter: on, newsletterUpdatedAt: new Date(), updatedAt: new Date() }).where(eq(customers.id, customer.id));
  }
  redirect(`/compte?ok=${on ? "newsletter_oui" : "newsletter_non"}#newsletter`);
}

export async function changePassword(fd: FormData) {
  const customer = await requireCustomer();
  const current = String(fd.get("actuel") ?? "");
  const next = String(fd.get("nouveau") ?? "");
  if (!(await verifyPassword(current, customer.passwordHash))) redirect("/compte?erreur=mot_de_passe_actuel#securite");
  if (next.length < MIN_CUSTOMER_PASSWORD || next.length > 200) redirect("/compte?erreur=mot_de_passe_court#securite");
  const db = await getDb();
  await db.update(customers).set({ passwordHash: await hashPassword(next), updatedAt: new Date() }).where(eq(customers.id, customer.id));
  await destroyAllCustomerSessions(customer.id);
  await createCustomerSession(customer.id);
  redirect("/compte?ok=mot_de_passe#securite");
}

/** Suppression du compte : les commandes restent (obligations comptables) mais ne sont plus rattachées. */
export async function deleteAccount(fd: FormData) {
  const customer = await requireCustomer();
  if (!(await verifyPassword(String(fd.get("confirmation") ?? ""), customer.passwordHash))) redirect("/compte?erreur=mot_de_passe_actuel#suppression");
  const db = await getDb();
  await db.delete(customers).where(eq(customers.id, customer.id));
  await destroyCustomerSession();
  redirect("/compte/connexion?ok=supprime");
}
