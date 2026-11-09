import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentAdmin } from "@/lib/auth/session";

/** Export CSV des inscrits à la newsletter (avec date du consentement). Réservé aux administrateurs. */
export async function GET() {
  if (!(await getCurrentAdmin())) return new Response("Accès refusé", { status: 401 });
  const db = await getDb();
  const rows = await db
    .select({ email: schema.customers.email, name: schema.customers.name, since: schema.customers.newsletterUpdatedAt })
    .from(schema.customers)
    .where(eq(schema.customers.newsletter, true))
    .orderBy(asc(schema.customers.email));
  // Champs entre guillemets ; neutralise les formules (=, +, -, @) à l’ouverture dans un tableur.
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const csv = ["email;nom;consentement", ...rows.map((r) => [r.email, r.name, r.since?.toISOString() ?? ""].map(cell).join(";"))].join("\r\n");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-maison-kayes.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
