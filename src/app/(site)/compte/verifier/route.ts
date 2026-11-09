import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { consumeToken } from "@/lib/customer/session";
import { markVerified } from "@/lib/customer/verify";

/** Lien de confirmation reçu par e-mail. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const customerId = await consumeToken(url.searchParams.get("jeton") ?? "", "verification");
  if (!customerId) return NextResponse.redirect(new URL("/compte?erreur=lien", url), 303);
  const db = await getDb();
  const [c] = await db.select().from(schema.customers).where(eq(schema.customers.id, customerId)).limit(1);
  if (c) await markVerified(c.id, c.email);
  return NextResponse.redirect(new URL("/compte?ok=verifie", url), 303);
}
