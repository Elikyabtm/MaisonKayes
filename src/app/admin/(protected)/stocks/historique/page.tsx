import type { Metadata } from "next";
import Link from "next/link";
import { dateTime, PageTitle } from "@/components/admin/ui";
import { stockReasons } from "@/db/schema";
import { listMovements } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Historique des stocks" };

export default async function HistoryPage({ searchParams }: PageProps<"/admin/stocks/historique">) {
  await requireAdmin();
  const sp = await searchParams;
  const variante = Number(sp.variante) || undefined;
  const page = Number(sp.page) || 1;
  const { rows, total, pages } = await listMovements({ variante, page });
  const href = (n: number) => `/admin/stocks/historique?${new URLSearchParams({ ...(variante && { variante: String(variante) }), page: String(n) })}`;

  return (
    <>
      <p className="mb-3">
        <Link href="/admin/stocks" className="link-arrow text-[0.75rem]">
          <span aria-hidden="true">←</span> Stocks
        </Link>
      </p>
      <PageTitle title="Historique des mouvements">
        {variante && (
          <Link href="/admin/stocks/historique" className="btn btn-ghost min-h-11">
            Toutes les variantes
          </Link>
        )}
      </PageTitle>
      <p className="eyebrow mb-3 text-brun-soft">
        {total} mouvement{total > 1 ? "s" : ""}
        {variante && rows[0] && ` · ${rows[0].productName}${rows[0].variantName !== "Unique" ? ` — ${rows[0].variantName}` : ""}`}
      </p>
      {rows.length ? (
        <ul>
          {rows.map(({ m, admin, variantName, productName, orderRef }) => (
            <li key={m.id} className="grid gap-1 border-b border-brun/20 py-3 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-4">
              <span className="text-sm text-brun-soft">{dateTime(m.createdAt)}</span>
              <span>
                <strong>{productName}</strong>
                {variantName !== "Unique" && ` — ${variantName}`}
                <span className="block text-sm">
                  {stockReasons[m.reason]}
                  {orderRef && (
                    <>
                      {" · "}
                      <Link href={`/admin/commandes/${m.orderId}`} className="underline">
                        {orderRef}
                      </Link>
                    </>
                  )}
                  {m.note && !orderRef && <span className="text-brun-soft"> · {m.note}</span>}
                  {admin && <span className="text-brun-soft"> · {admin}</span>}
                </span>
              </span>
              <span className="font-semibold sm:text-right">
                {m.delta > 0 ? `+${m.delta}` : m.delta}
                <span className="block text-sm font-normal text-brun-soft">
                  {m.stockBefore ?? "à renseigner"} → {m.stockAfter}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-2 border-dashed border-brun/40 p-6 text-center text-brun-soft">Aucun mouvement enregistré.</p>
      )}
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex justify-between">
          {page > 1 ? <Link href={href(page - 1)} className="btn btn-ghost min-h-11">← Récents</Link> : <span />}
          {page < pages ? <Link href={href(page + 1)} className="btn btn-ghost min-h-11">Anciens →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
