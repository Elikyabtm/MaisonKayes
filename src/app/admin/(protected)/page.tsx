import type { Metadata } from "next";
import Link from "next/link";
import { itemsSummary } from "@/components/admin/OrderSummary";
import { dateTime, PageTitle, StockBadge } from "@/components/admin/ui";
import { getOverview } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Vue d’ensemble" };

export default async function AdminHome() {
  await requireAdmin();
  const o = await getOverview();
  const tiles = [
    { label: "À préparer", value: o.counts.toPrepare, href: "/admin/commandes?statut=a_preparer&paiement=paye", tone: "bg-orange" },
    { label: "Paiement en attente", value: o.counts.awaitingPayment, href: "/admin/commandes?paiement=en_attente", tone: "bg-creme-deep" },
    { label: "Expédiées", value: o.counts.shipped, href: "/admin/commandes?statut=expediee", tone: "bg-safran" },
    { label: "Remises", value: o.counts.delivered, href: "/admin/commandes?statut=remise", tone: "bg-creme-deep" },
    { label: "Stock bas", value: o.lowStock.length, href: "/admin/stocks?filtre=bas", tone: "bg-safran" },
    { label: "Ruptures", value: o.outOfStock.length, href: "/admin/stocks?filtre=rupture", tone: "bg-orange" },
  ];

  return (
    <>
      <PageTitle title="Vue d’ensemble" />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className={`flex h-full flex-col justify-between border-2 border-brun p-4 hover:-translate-y-0.5 ${t.tone}`}>
              <span className="eyebrow text-[0.7rem]">{t.label}</span>
              <span className="display mt-3 text-5xl">{t.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      {o.failedEmails > 0 && (
        <p role="alert" className="mt-6 border-2 border-brun bg-orange/25 px-4 py-3">
          <strong>
            {o.failedEmails} e-mail{o.failedEmails > 1 ? "s" : ""} de commande en échec.
          </strong>{" "}
          Les commandes restent valides ; relancez l’envoi depuis chaque commande.{" "}
          <Link href="/admin/commandes?email=echec" className="font-semibold underline">
            Voir les commandes concernées
          </Link>
        </p>
      )}

      {o.unknownStock.length > 0 && (
        <p className="mt-6 border-2 border-brun bg-creme-deep px-4 py-3">
          <strong>{o.unknownStock.length} variante{o.unknownStock.length > 1 ? "s" : ""}</strong> sans stock renseigné : ces
          pièces ne peuvent pas être commandées en ligne.{" "}
          <Link href="/admin/stocks?filtre=inconnu" className="font-semibold underline">
            Renseigner les stocks
          </Link>
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="a-preparer">
          <div className="flex items-end justify-between border-b-2 border-brun pb-2">
            <h2 id="a-preparer" className="display text-2xl">
              Commandes à préparer
            </h2>
            <Link href="/admin/commandes?statut=a_preparer&paiement=paye" className="link-arrow text-[0.75rem]">
              Tout voir <span aria-hidden="true">→</span>
            </Link>
          </div>
          {o.toPrepare.length ? (
            <ul>
              {o.toPrepare.map((order) => (
                <li key={order.id} className="border-b border-brun/20">
                  <Link href={`/admin/commandes/${order.id}`} className="flex flex-col gap-1 py-3 hover:bg-creme-deep sm:px-2">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <strong>{order.reference}</strong>
                      <span className="text-sm text-brun-soft">{dateTime(order.createdAt)}</span>
                    </span>
                    <span className="text-sm">
                      {order.shippingName ?? order.customerName} · {order.shippingLabel ?? order.shippingAddress?.country}
                    </span>
                    <span className="text-sm text-brun-soft">
                      {itemsSummary(order.items)} · {formatMoney(order.totalCents, order.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-brun-soft">Aucune commande à préparer.</p>
          )}
        </section>

        <section aria-labelledby="alertes-stock">
          <div className="flex items-end justify-between border-b-2 border-brun pb-2">
            <h2 id="alertes-stock" className="display text-2xl">
              Alertes de stock
            </h2>
            <Link href="/admin/stocks" className="link-arrow text-[0.75rem]">
              Stocks <span aria-hidden="true">→</span>
            </Link>
          </div>
          {o.outOfStock.length + o.lowStock.length ? (
            <ul>
              {[...o.outOfStock, ...o.lowStock].map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-brun/20 py-3">
                  <span>
                    <Link href={`/admin/stocks#variante-${v.id}`} className="font-semibold hover:underline">
                      {v.product.name}
                    </Link>
                    {v.name !== "Unique" && <span className="text-brun-soft"> — {v.name}</span>}
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    {v.stock} / seuil {v.lowStockThreshold} <StockBadge level={v.level} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-brun-soft">Aucun produit en stock bas ou en rupture.</p>
          )}
        </section>
      </div>
    </>
  );
}
