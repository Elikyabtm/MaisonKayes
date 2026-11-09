import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Metadata } from "next";
import { Badge, dateTime, inputClass, labelClass, PageTitle } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Clients" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/clients">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const nl = sp.newsletter === "1";
  const db = await getDb();
  const { customers, orders } = schema;
  const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const where = q ? or(ilike(customers.name, like), ilike(customers.email, like)) : undefined;
  const rows = await db
    .select({ c: customers, orders: count(orders.id) })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(nl ? and(where, eq(customers.newsletter, true)) : where)
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt))
    .limit(200);
  const [{ n: subscribers }] = await db.select({ n: count() }).from(customers).where(eq(customers.newsletter, true));

  return (
    <>
      <PageTitle title="Clients">
        <a href="/admin/clients/newsletter.csv" className="btn btn-ghost min-h-11">
          Exporter les inscrits newsletter ({subscribers})
        </a>
      </PageTitle>
      <form role="search" className="grid gap-3 border-2 border-brun bg-creme-deep p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <label htmlFor="q" className={labelClass}>
            Rechercher
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Nom ou e-mail" className={inputClass} />
        </div>
        <label className="flex min-h-11 items-center gap-2">
          <input type="checkbox" name="newsletter" value="1" defaultChecked={nl} className="h-5 w-5 accent-brun" />
          Inscrits newsletter
        </label>
        <button type="submit" className="btn btn-primary min-h-11">
          Filtrer
        </button>
      </form>
      <p className="eyebrow mt-6 text-brun-soft">
        {rows.length} compte{rows.length > 1 ? "s" : ""}
      </p>
      {rows.length ? (
        <ul className="mt-3">
          {rows.map(({ c, orders: n }) => (
            <li key={c.id} className="flex flex-col gap-1 border-b border-brun/20 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0">
                <strong>{c.name}</strong>
                <span className="block break-all text-sm text-brun-soft">
                  <a href={`mailto:${c.email}`} className="underline">
                    {c.email}
                  </a>
                  {c.phone && ` · ${c.phone}`}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-1.5 text-sm">
                {c.emailVerifiedAt ? <Badge kind="ok">E-mail confirmé</Badge> : <Badge kind="muted">Non confirmé</Badge>}
                {c.newsletter && <Badge kind="warn">Newsletter</Badge>}
                <a href={`/admin/commandes?q=${encodeURIComponent(c.email)}`} className="underline">
                  {n} commande{n > 1 ? "s" : ""}
                </a>
                <span className="text-brun-soft">· inscrit le {dateTime(c.createdAt)}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-2 border-dashed border-brun/40 p-6 text-center text-brun-soft">Aucun compte client.</p>
      )}
      <p className="mt-6 text-sm text-brun-soft">
        Les clients gèrent eux-mêmes leur profil, leur adresse et leur inscription à la newsletter depuis leur compte. Les comptes ne donnent
        aucun accès à ce dashboard.
      </p>
    </>
  );
}
