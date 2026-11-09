import type { Metadata } from "next";
import Link from "next/link";
import { itemsSummary } from "@/components/admin/OrderSummary";
import { dateTime, Flash, FulfillmentBadge, inputClass, labelClass, PageTitle, PaymentBadge } from "@/components/admin/ui";
import { fulfillmentStatuses, paymentStatuses } from "@/db/schema";
import { fulfillmentLabels, paymentLabels } from "@/lib/admin/labels";
import { listOrders } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Commandes" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  await requireAdmin();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const filters = { q: str("q"), statut: str("statut"), paiement: str("paiement"), page: Number(str("page")) || 1 };
  const { orders, total, page, pages } = await listOrders(filters);
  const pageHref = (n: number) => {
    const u = new URLSearchParams({ ...(filters.q && { q: filters.q }), ...(filters.statut && { statut: filters.statut }), ...(filters.paiement && { paiement: filters.paiement }), page: String(n) });
    return `/admin/commandes?${u}`;
  };

  return (
    <>
      <PageTitle title="Commandes" />
      <Flash params={sp} />
      <form role="search" className="grid gap-3 border-2 border-brun bg-creme-deep p-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="q" className={labelClass}>
            Rechercher
          </label>
          <input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Référence, client, e-mail, suivi, article…" className={inputClass} />
        </div>
        <div>
          <label htmlFor="statut" className={labelClass}>
            Préparation
          </label>
          <select id="statut" name="statut" defaultValue={filters.statut} className={inputClass}>
            <option value="">Tous</option>
            {fulfillmentStatuses.map((s) => (
              <option key={s} value={s}>
                {fulfillmentLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="paiement" className={labelClass}>
            Paiement
          </label>
          <select id="paiement" name="paiement" defaultValue={filters.paiement} className={inputClass}>
            <option value="">Tous</option>
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>
                {paymentLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary min-h-11 flex-1">
            Filtrer
          </button>
          {(filters.q || filters.statut || filters.paiement) && (
            <Link href="/admin/commandes" className="btn btn-ghost min-h-11">
              Effacer
            </Link>
          )}
        </div>
      </form>

      <p className="eyebrow mt-6 text-brun-soft" aria-live="polite">
        {total} commande{total > 1 ? "s" : ""}
      </p>

      {orders.length ? (
        <div className="mt-3">
          {/* En-têtes (ordinateur) */}
          <div className="hidden grid-cols-[7rem_8rem_1fr_1.4fr_6rem_7rem_7rem] gap-3 border-b-2 border-brun px-2 pb-2 text-[0.7rem] font-bold uppercase tracking-wide [font-stretch:85%] lg:grid" aria-hidden="true">
            <span>Référence</span>
            <span>Date</span>
            <span>Client</span>
            <span>Articles</span>
            <span className="text-right">Total</span>
            <span>Paiement</span>
            <span>Préparation</span>
          </div>
          <ul>
            {orders.map((o) => (
              <li key={o.id} className="border-b border-brun/20">
                <Link
                  href={`/admin/commandes/${o.id}`}
                  className="grid grid-cols-2 gap-x-3 gap-y-1 px-2 py-3 hover:bg-creme-deep lg:grid-cols-[7rem_8rem_1fr_1.4fr_6rem_7rem_7rem] lg:items-center"
                >
                  <strong className="lg:order-none">{o.reference ?? `#${o.id}`}</strong>
                  <span className="text-right text-sm text-brun-soft lg:text-left">{dateTime(o.createdAt)}</span>
                  <span className="col-span-2 truncate lg:col-span-1">
                    {o.customerName ?? "—"}
                    <span className="block truncate text-sm text-brun-soft">{o.customerEmail}</span>
                  </span>
                  <span className="col-span-2 text-sm lg:col-span-1">{itemsSummary(o.items)}</span>
                  <span className="font-semibold lg:text-right">{formatMoney(o.totalCents, o.currency)}</span>
                  <span className="flex flex-wrap justify-end gap-1 lg:contents">
                    <span className="lg:block">
                      <PaymentBadge status={o.paymentStatus} />
                    </span>
                    <span className="lg:block">
                      <FulfillmentBadge status={o.fulfillmentStatus} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="btn btn-ghost min-h-11">
                  <span aria-hidden="true">←</span> Précédentes
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm">
                Page {page} / {pages}
              </span>
              {page < pages ? (
                <Link href={pageHref(page + 1)} className="btn btn-ghost min-h-11">
                  Suivantes <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      ) : (
        <p className="mt-6 border-2 border-dashed border-brun/40 p-6 text-center text-brun-soft">
          {filters.q || filters.statut || filters.paiement
            ? "Aucune commande ne correspond à ces critères."
            : "Aucune commande pour le moment. Elles apparaîtront ici dès le premier paiement validé par Stripe."}
        </p>
      )}
    </>
  );
}
