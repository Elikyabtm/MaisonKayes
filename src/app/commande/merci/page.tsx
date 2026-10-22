import type { Metadata } from "next";
import Link from "next/link";
import { Diamond } from "@/components/Shapes";
import { instagram, site } from "@/data/site";
import { formatMoney } from "@/lib/shop";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Merci pour votre commande", robots: { index: false } };

async function getOrder(sessionId: string | undefined) {
  const stripe = getStripe();
  if (!stripe || !sessionId?.startsWith("cs_")) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
    if (session.payment_status === "unpaid") return null;
    return session;
  } catch {
    return null;
  }
}

export default async function MerciPage({ searchParams }: PageProps<"/commande/merci">) {
  const { session_id } = await searchParams;
  const order = await getOrder(typeof session_id === "string" ? session_id : undefined);
  const ig = instagram();
  const name = order?.customer_details?.name?.split(" ")[0];

  return (
    <section className="container-x pb-24 pt-20 md:pt-28">
      <p className="eyebrow text-ocre-ink">Commande</p>
      <h1 className="display mt-4 text-[clamp(3rem,9vw,7.5rem)]">
        Merci{name ? ` ${name}` : ""}
        <Diamond className="ml-4 inline-block h-[0.45em] w-[0.45em] align-middle text-orange" />
      </h1>

      {order ? (
        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="text-lg md:text-xl">
              Votre commande est bien enregistrée
              {order.payment_status === "paid" ? " et payée" : " ; le paiement est en cours de confirmation"}.
              {order.customer_details?.email && <> Une confirmation est envoyée à {order.customer_details.email}.</>}
            </p>
            <p className="mt-4">Maison Kayes prépare maintenant votre commande.</p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <h2 className="eyebrow border-b-2 border-brun pb-2">Récapitulatif</h2>
            <ul>
              {order.line_items?.data.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 border-b border-brun/20 py-3">
                  <span>
                    {item.description} {item.quantity && item.quantity > 1 && <>× {item.quantity}</>}
                  </span>
                  <span>{formatMoney(item.amount_total, item.currency)}</span>
                </li>
              ))}
              {order.shipping_cost && (
                <li className="flex justify-between gap-4 border-b border-brun/20 py-3">
                  <span>Livraison</span>
                  <span>{formatMoney(order.shipping_cost.amount_total, order.currency ?? "eur")}</span>
                </li>
              )}
              {order.amount_total != null && (
                <li className="flex justify-between gap-4 py-3 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatMoney(order.amount_total, order.currency ?? "eur")}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-8 max-w-2xl text-lg">
          Si vous venez de passer commande, une confirmation vous est envoyée par e-mail. Pour toute question, écrivez à{" "}
          {site.contact.email ? (
            <a href={`mailto:${site.contact.email}`} className="underline">
              {site.contact.email}
            </a>
          ) : (
            <Link href="/contact" className="underline">
              Maison Kayes
            </Link>
          )}
          .
        </p>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/creations" className="btn btn-primary">
          Continuer la visite <span aria-hidden="true">→</span>
        </Link>
        {ig && (
          <a href={ig.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Suivre {ig.handle} <span aria-hidden="true">↗</span>
            <span className="sr-only">(Instagram, ouvre un nouvel onglet)</span>
          </a>
        )}
      </div>
    </section>
  );
}
