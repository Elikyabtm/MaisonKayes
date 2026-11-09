import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, dateTime, Flash, FulfillmentBadge, inputClass, labelClass, PageTitle, PaymentBadge } from "@/components/admin/ui";
import { orderEmailKinds, stockReasons, type OrderEmailKind } from "@/db/schema";
import { cancelOrderAction, retryOrderEmail, updateOrder } from "@/lib/admin/actions/orders";
import { managementEmail, orderEmailLabels } from "@/lib/email/order-emails";
import { emailConfigured } from "@/lib/email/resend";
import { fulfillmentLabels } from "@/lib/admin/labels";
import { getOrder } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Commande" };

const countryName = (code: string | null | undefined) => {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(["fr"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

export default async function OrderPage({ params, searchParams }: PageProps<"/admin/commandes/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const order = Number.isInteger(Number(id)) ? await getOrder(Number(id)) : null;
  if (!order) notFound();

  const money = (c: number) => formatMoney(c, order.currency);
  const a = order.shippingAddress;
  const stripeTest = (process.env.STRIPE_SECRET_KEY ?? "").includes("_test_");
  const stripeUrl = order.stripePaymentIntentId
    ? `https://dashboard.stripe.com/${stripeTest ? "test/" : ""}payments/${order.stripePaymentIntentId}`
    : null;
  const cancelled = order.fulfillmentStatus === "annulee";
  const self = `/admin/commandes/${order.id}`;

  return (
    <>
      <p className="mb-3">
        <Link href="/admin/commandes" className="link-arrow text-[0.75rem]">
          <span aria-hidden="true">←</span> Commandes
        </Link>
      </p>
      <PageTitle title={order.reference ?? `Commande #${order.id}`}>
        <PaymentBadge status={order.paymentStatus} />
        <FulfillmentBadge status={order.fulfillmentStatus} />
      </PageTitle>
      <Flash params={sp} />
      <p className="-mt-3 mb-6 text-sm text-brun-soft">Passée le {dateTime(order.createdAt)}</p>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          <section aria-labelledby="articles">
            <h2 id="articles" className="eyebrow border-b-2 border-brun pb-2">
              Articles
            </h2>
            <ul>
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 border-b border-brun/20 py-3">
                  <span>
                    <strong>{i.productName}</strong>
                    {i.variantName && <span className="block text-sm">Variante : {i.variantName}</span>}
                    <span className="block text-sm text-brun-soft">
                      {i.quantity} × {money(i.unitCents)}
                    </span>
                  </span>
                  <span className="font-semibold">{money(i.totalCents)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt>Sous-total</dt>
                <dd>{money(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Livraison{order.shippingLabel ? ` (${order.shippingLabel})` : ""}</dt>
                <dd>{money(order.shippingCents)}</dd>
              </div>
              <div className="flex justify-between border-t-2 border-brun pt-2 text-base font-bold">
                <dt>Total payé</dt>
                <dd>{money(order.totalCents)}</dd>
              </div>
              {order.refundedCents > 0 && (
                <div className="flex justify-between text-brun-soft">
                  <dt>Remboursé</dt>
                  <dd>− {money(order.refundedCents)}</dd>
                </div>
              )}
            </dl>
          </section>

          <div className="grid gap-8 sm:grid-cols-2">
            <section aria-labelledby="client">
              <h2 id="client" className="eyebrow border-b-2 border-brun pb-2">
                Client
              </h2>
              <p className="mt-3 font-semibold">{order.customerName ?? "—"}</p>
              {order.customerEmail && (
                <p>
                  <a href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Votre commande ${order.reference ?? ""}`)}`} className="break-all underline">
                    {order.customerEmail}
                  </a>
                </p>
              )}
              {order.customerPhone && (
                <p>
                  <a href={`tel:${order.customerPhone}`} className="underline">
                    {order.customerPhone}
                  </a>
                </p>
              )}
            </section>
            <section aria-labelledby="livraison">
              <h2 id="livraison" className="eyebrow border-b-2 border-brun pb-2">
                Livraison
              </h2>
              {a ? (
                <address className="mt-3 not-italic">
                  <strong>{order.shippingName}</strong>
                  <br />
                  {a.line1}
                  {a.line2 && (
                    <>
                      <br />
                      {a.line2}
                    </>
                  )}
                  <br />
                  {[a.postalCode, a.city].filter(Boolean).join(" ")}
                  {a.state && (
                    <>
                      <br />
                      {a.state}
                    </>
                  )}
                  <br />
                  {countryName(a.country)}
                </address>
              ) : (
                <p className="mt-3 text-brun-soft">Adresse non transmise.</p>
              )}
            </section>
          </div>

          <section aria-labelledby="paiement">
            <h2 id="paiement" className="eyebrow border-b-2 border-brun pb-2">
              Paiement
            </h2>
            <p className="mt-3 flex flex-wrap items-center gap-2">
              <PaymentBadge status={order.paymentStatus} />
              {stripeUrl && (
                <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                  Voir le paiement dans Stripe <span aria-hidden="true">↗</span>
                  <span className="sr-only">(nouvel onglet)</span>
                </a>
              )}
            </p>
            <p className="mt-2 text-sm text-brun-soft">Session Stripe : {order.stripeSessionId}</p>
          </section>

          <section aria-labelledby="emails">
            <h2 id="emails" className="eyebrow border-b-2 border-brun pb-2">
              E-mails
            </h2>
            {!emailConfigured() && (
              <p className="mt-3 border-2 border-brun bg-orange/20 px-3 py-2 text-sm font-semibold">
                Envoi d’e-mails non configuré (RESEND_API_KEY et EMAIL_FROM) : les envois échoueront jusqu’à sa mise en place.
              </p>
            )}
            <ul>
              {orderEmailKinds.map((kind) => {
                const e = order.emails.find((x) => x.kind === kind);
                const applicable = kind === "expedition" ? Boolean(order.shippedAt) && !cancelled : order.paymentStatus === "paye" && !cancelled;
                const stale = Boolean(e?.stale);
                const canSend = applicable && (!e || e.status === "echec" || stale);
                return (
                  <li key={kind} className="border-b border-brun/20 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{orderEmailLabels[kind]}</span>
                      <EmailBadge status={e?.status} />
                    </div>
                    <p className="mt-1 text-sm text-brun-soft">
                      {e?.status === "envoye" && e.sentAt && (
                        <>
                          Envoyé le {dateTime(e.sentAt)} à {e.recipient}
                          {e.attempts > 1 && ` (après ${e.attempts} tentatives)`}.
                        </>
                      )}
                      {e?.status === "en_cours" && (stale ? "Envoi interrompu." : "Envoi en cours…")}
                      {!e && (applicable ? "Pas encore envoyé." : pendingText(kind, cancelled))}
                    </p>
                    {e?.status === "echec" && (
                      <p role="alert" className="mt-2 border-l-4 border-orange bg-orange/10 px-3 py-2 text-sm">
                        <strong>Échec{e.attempts > 1 ? ` (tentative ${e.attempts})` : ""} :</strong> {e.lastError}
                      </p>
                    )}
                    {canSend && (
                      <form action={retryOrderEmail} className="mt-2">
                        <input type="hidden" name="id" value={order.id} />
                        <input type="hidden" name="type" value={kind} />
                        <input type="hidden" name="retour" value={`${self}#emails`} />
                        <button type="submit" className="btn btn-ghost min-h-10 px-3 py-1.5 text-[0.75rem]">
                          {e ? "Relancer cet e-mail" : "Envoyer cet e-mail"}
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-sm text-brun-soft">
              Notifications internes envoyées à {managementEmail() ?? "— (adresse de gestion non configurée)"}. Les reçus de paiement et de
              remboursement sont envoyés par Stripe.
            </p>
          </section>

          {order.movements.length > 0 && (
            <section aria-labelledby="mouvements">
              <h2 id="mouvements" className="eyebrow border-b-2 border-brun pb-2">
                Mouvements de stock liés
              </h2>
              <ul className="text-sm">
                {order.movements.map(({ m, productName, variantName }) => (
                  <li key={m.id} className="flex justify-between gap-3 border-b border-brun/20 py-2">
                    <span>
                      {productName}
                      {variantName !== "Unique" && ` — ${variantName}`} · {stockReasons[m.reason]}
                    </span>
                    <span className={m.delta < 0 ? "text-brun" : "font-semibold"}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta} → {m.stockAfter}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section aria-labelledby="preparation" className="border-2 border-brun p-4 md:p-5">
            <h2 id="preparation" className="display text-2xl">
              Préparation
            </h2>
            {cancelled ? (
              <p className="mt-3">
                Commande annulée{order.cancelledAt ? ` le ${dateTime(order.cancelledAt)}` : ""}. Son statut ne peut plus changer.
              </p>
            ) : (
              <form action={updateOrder} className="mt-4 space-y-4">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="retour" value={self} />
                <fieldset>
                  <legend className={labelClass}>Statut</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(["a_preparer", "expediee", "remise"] as const).map((s) => (
                      <label
                        key={s}
                        className="flex min-h-11 cursor-pointer items-center justify-center gap-2 border-2 border-brun/40 px-2 text-center text-sm font-semibold has-[:checked]:border-brun has-[:checked]:bg-safran has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brun has-[:focus-visible]:outline"
                      >
                        <input type="radio" name="statut" value={s} defaultChecked={order.fulfillmentStatus === s} className="sr-only" />
                        {fulfillmentLabels[s]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label htmlFor="transporteur" className={labelClass}>
                      Transporteur
                    </label>
                    <input id="transporteur" name="transporteur" defaultValue={order.carrier ?? ""} placeholder="bpost, Colissimo…" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="suivi" className={labelClass}>
                      Numéro de suivi
                    </label>
                    <input id="suivi" name="suivi" defaultValue={order.trackingNumber ?? ""} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="lien_suivi" className={labelClass}>
                    Lien de suivi (facultatif)
                  </label>
                  <input
                    id="lien_suivi"
                    name="lien_suivi"
                    type="url"
                    inputMode="url"
                    placeholder="https://…"
                    defaultValue={order.trackingUrl ?? ""}
                    className={inputClass}
                  />
                  <p className="mt-1 text-sm text-brun-soft">
                    Au premier passage en « Expédiée », le client reçoit un e-mail avec sa référence et ces informations de suivi.
                  </p>
                </div>
                <div>
                  <label htmlFor="note" className={labelClass}>
                    Note interne
                  </label>
                  <textarea id="note" name="note" rows={3} defaultValue={order.note ?? ""} className={`${inputClass} py-2`} />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Enregistrer
                </button>
                {(order.shippedAt || order.deliveredAt) && (
                  <p className="text-sm text-brun-soft">
                    {order.shippedAt && <>Expédiée le {dateTime(order.shippedAt)}. </>}
                    {order.deliveredAt && <>Remise le {dateTime(order.deliveredAt)}.</>}
                  </p>
                )}
              </form>
            )}
            {cancelled && order.note && <p className="mt-3 whitespace-pre-line text-sm text-brun-soft">{order.note}</p>}
          </section>

          {!cancelled && (
            <section aria-labelledby="annuler" className="border-2 border-dashed border-brun/50 p-4 md:p-5">
              <h2 id="annuler" className="eyebrow">
                Annuler la commande
              </h2>
              <form action={cancelOrderAction} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="retour" value={self} />
                <label className="flex items-start gap-2">
                  <input type="checkbox" name="remettre_en_stock" defaultChecked={order.stockApplied} disabled={!order.stockApplied} className="mt-1 h-4 w-4 accent-brun" />
                  <span>
                    Remettre les articles en stock
                    {!order.stockApplied && <span className="block text-sm text-brun-soft">Aucun stock n’a été retiré pour cette commande.</span>}
                  </span>
                </label>
                <div>
                  <label htmlFor="motif" className={labelClass}>
                    Motif (facultatif)
                  </label>
                  <input id="motif" name="motif" className={inputClass} />
                </div>
                <p className="text-sm text-brun-soft">
                  L’annulation ne rembourse pas le client : effectuez le remboursement dans Stripe
                  {stripeUrl ? (
                    <>
                      {" "}
                      (
                      <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        ouvrir le paiement
                      </a>
                      )
                    </>
                  ) : null}
                  . Le statut de paiement se mettra à jour automatiquement.
                </p>
                <button type="submit" className="btn btn-ghost w-full">
                  Annuler la commande
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function EmailBadge({ status }: { status?: string }) {
  if (status === "envoye") return <Badge kind="ok">Envoyé</Badge>;
  if (status === "echec") return <Badge kind="alert">Échec</Badge>;
  if (status === "en_cours") return <Badge kind="warn">En cours</Badge>;
  return <Badge kind="muted">Non envoyé</Badge>;
}

function pendingText(kind: OrderEmailKind, cancelled: boolean) {
  if (cancelled) return "Commande annulée : aucun envoi.";
  return kind === "expedition" ? "Envoyé au premier passage en « Expédiée »." : "Envoyé dès la confirmation du paiement.";
}
