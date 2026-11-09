import type { Metadata } from "next";
import Link from "next/link";
import { fieldClass, fieldLabel } from "@/components/account/forms";
import { shippingZones } from "@/data/shipping";
import type { FulfillmentStatus } from "@/db/schema";
import {
  changePassword,
  customerLogout,
  deleteAccount,
  resendVerification,
  updateAddress,
  updateNewsletter,
  updateProfile,
} from "@/lib/customer/actions";
import { getCustomerOrders } from "@/lib/customer/orders";
import { requireCustomer } from "@/lib/customer/session";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };

const messages: Record<string, string> = {
  bienvenue: "Bienvenue ! Votre compte est créé. Un e-mail de confirmation vient de vous être envoyé.",
  bienvenue_sans_email: "Bienvenue ! Votre compte est créé. L’e-mail de confirmation n’a pas pu partir : renvoyez-le ci-dessous.",
  verifie: "Adresse e-mail confirmée. Vos commandes passées avec cette adresse sont rattachées à votre compte.",
  verification_envoyee: "Un nouvel e-mail de confirmation vient de vous être envoyé.",
  profil: "Profil enregistré.",
  adresse: "Adresse enregistrée : elle sera pré-remplie lors de vos prochaines commandes.",
  adresse_effacee: "Adresse effacée.",
  newsletter_oui: "Inscription à la newsletter enregistrée.",
  newsletter_non: "Vous êtes désinscrit·e de la newsletter.",
  mot_de_passe: "Mot de passe enregistré.",
};
const errors: Record<string, string> = {
  lien: "Ce lien de confirmation a expiré ou a déjà été utilisé.",
  patience: "Un e-mail vient déjà d’être envoyé : patientez deux minutes avant d’en redemander un.",
  email_indisponible: "L’e-mail n’a pas pu être envoyé. Réessayez plus tard ou écrivez-nous.",
  nom: "Indiquez votre nom.",
  telephone: "Numéro de téléphone invalide.",
  adresse: "Adresse incomplète : rue, code postal et ville sont obligatoires.",
  pays: "Nous ne livrons pas encore ce pays.",
  mot_de_passe_actuel: "Mot de passe actuel incorrect.",
  mot_de_passe_court: "Le nouveau mot de passe doit contenir au moins 10 caractères.",
};

const statusLabel = (s: FulfillmentStatus, paid: boolean) =>
  !paid && s === "a_preparer" ? "Paiement en attente" : ({ a_preparer: "En préparation", expediee: "Expédiée", remise: "Livrée", annulee: "Annulée" } as const)[s];

const dateFr = (d: Date) => new Intl.DateTimeFormat("fr-BE", { dateStyle: "long", timeZone: "Europe/Brussels" }).format(d);

const countries = () => {
  const names = new Intl.DisplayNames(["fr"], { type: "region" });
  return [...new Set(shippingZones.flatMap((z) => z.countries))]
    .map((code) => ({ code, name: names.of(code) ?? code }))
    .sort((a, b) => (a.code === "BE" ? -1 : b.code === "BE" ? 1 : a.name.localeCompare(b.name, "fr")));
};

export default async function AccountPage({ searchParams }: PageProps<"/compte">) {
  const customer = await requireCustomer();
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? messages[sp.ok] : undefined;
  const err = typeof sp.erreur === "string" ? errors[sp.erreur] : undefined;
  const orders = await getCustomerOrders(customer.id);
  const a = customer.shippingAddress;

  return (
    <div className="container-x pb-24 pt-14 md:pt-20 lg:pt-24">
      <div className="flex flex-col gap-4 border-b-2 border-brun pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-ocre-ink">Mon compte</p>
          <h1 className="display mt-3 text-[clamp(2.8rem,8vw,5.5rem)]">Bonjour {customer.name.split(" ")[0]}</h1>
          <p className="mt-2 text-brun-soft">{customer.email}</p>
        </div>
        <form action={customerLogout}>
          <button type="submit" className="btn btn-ghost">
            Se déconnecter
          </button>
        </form>
      </div>

      {(ok || err) && (
        <p role={err ? "alert" : "status"} className={`mt-6 border-2 border-brun px-4 py-3 font-semibold ${err ? "bg-orange/20" : "bg-safran/30"}`}>
          {err ?? ok}
        </p>
      )}

      {!customer.emailVerifiedAt && (
        <div className="mt-6 flex flex-col gap-3 border-2 border-brun bg-creme-deep p-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>Confirmez votre adresse e-mail</strong> grâce au lien reçu par e-mail. Les commandes passées sans compte avec cette adresse
            apparaîtront ensuite ici.
          </p>
          <form action={resendVerification}>
            <button type="submit" className="btn btn-ghost min-h-11 whitespace-nowrap">
              Renvoyer le lien
            </button>
          </form>
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        {/* ——— Commandes ——— */}
        <section aria-labelledby="commandes" className="lg:col-span-7">
          <h2 id="commandes" className="display text-[clamp(2rem,5vw,3rem)]">
            Mes commandes
          </h2>
          {orders.length === 0 ? (
            <div className="mt-6 border-2 border-dashed border-brun/40 p-6">
              <p>Vous n’avez pas encore de commande.</p>
              <Link href="/creations" className="link-arrow mt-4">
                Découvrir les créations <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-5">
              {orders.map((o) => (
                <li key={o.id} className="border-2 border-brun">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-brun bg-creme-deep px-4 py-3">
                    <span>
                      <strong>{o.reference}</strong>
                      <span className="text-brun-soft"> · {dateFr(o.createdAt)}</span>
                    </span>
                    <span className={`eyebrow px-2 py-1 text-[0.7rem] ${o.fulfillmentStatus === "annulee" ? "bg-creme" : o.fulfillmentStatus === "a_preparer" ? "bg-safran" : "bg-brun text-creme"}`}>
                      {statusLabel(o.fulfillmentStatus, o.paymentStatus !== "en_attente")}
                    </span>
                  </div>
                  <ul className="px-4">
                    {o.items.map((i) => (
                      <li key={i.id} className="flex justify-between gap-4 border-b border-brun/15 py-2.5">
                        <span>
                          {i.productName}
                          {i.variantName && <span className="text-brun-soft"> — {i.variantName}</span>}
                          <span className="text-brun-soft"> × {i.quantity}</span>
                        </span>
                        <span>{formatMoney(i.totalCents, o.currency)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <span className="font-bold">Total payé : {formatMoney(o.totalCents, o.currency)}</span>
                    {o.fulfillmentStatus !== "annulee" && (o.trackingUrl || o.trackingNumber) && (
                      <span className="text-sm">
                        {o.carrier && `${o.carrier} · `}
                        {o.trackingUrl ? (
                          <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                            Suivre mon colis {o.trackingNumber && `(${o.trackingNumber})`} <span aria-hidden="true">↗</span>
                            <span className="sr-only">(nouvel onglet)</span>
                          </a>
                        ) : (
                          <>Suivi : {o.trackingNumber}</>
                        )}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ——— Profil, adresse, préférences ——— */}
        <div className="space-y-10 lg:col-span-5">
          <section id="profil" aria-labelledby="profil-titre" className="scroll-mt-28">
            <h2 id="profil-titre" className="eyebrow border-b-2 border-brun pb-2">
              Profil
            </h2>
            <form action={updateProfile} className="mt-4 space-y-4">
              <div>
                <label htmlFor="nom" className={fieldLabel}>
                  Prénom et nom
                </label>
                <input id="nom" name="nom" required defaultValue={customer.name} autoComplete="name" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="telephone" className={fieldLabel}>
                  Téléphone (facultatif)
                </label>
                <input id="telephone" name="telephone" type="tel" defaultValue={customer.phone ?? ""} autoComplete="tel" className={fieldClass} />
              </div>
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
            </form>
          </section>

          <section id="adresse" aria-labelledby="adresse-titre" className="scroll-mt-28">
            <h2 id="adresse-titre" className="eyebrow border-b-2 border-brun pb-2">
              Adresse de livraison
            </h2>
            <p className="mt-3 text-sm text-brun-soft">Pré-remplie lors du paiement. Elle est aussi enregistrée automatiquement après une commande.</p>
            <form action={updateAddress} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="destinataire" className={fieldLabel}>
                  Destinataire
                </label>
                <input id="destinataire" name="destinataire" defaultValue={a?.name ?? customer.name} autoComplete="shipping name" className={fieldClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="rue" className={fieldLabel}>
                  Rue et numéro
                </label>
                <input id="rue" name="adresse" required defaultValue={a?.line1 ?? ""} autoComplete="shipping address-line1" className={fieldClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="complement" className={fieldLabel}>
                  Complément (facultatif)
                </label>
                <input id="complement" name="complement" defaultValue={a?.line2 ?? ""} autoComplete="shipping address-line2" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="code_postal" className={fieldLabel}>
                  Code postal
                </label>
                <input id="code_postal" name="code_postal" required defaultValue={a?.postalCode ?? ""} autoComplete="shipping postal-code" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="ville" className={fieldLabel}>
                  Ville
                </label>
                <input id="ville" name="ville" required defaultValue={a?.city ?? ""} autoComplete="shipping address-level2" className={fieldClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pays" className={fieldLabel}>
                  Pays
                </label>
                <select id="pays" name="pays" defaultValue={a?.country ?? "BE"} autoComplete="shipping country" className={fieldClass}>
                  {countries().map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button type="submit" className="btn btn-primary">
                  Enregistrer l’adresse
                </button>
                {a && (
                  <button type="submit" name="effacer" value="1" formNoValidate className="btn btn-ghost">
                    Effacer
                  </button>
                )}
              </div>
            </form>
          </section>

          <section id="newsletter" aria-labelledby="newsletter-titre" className="scroll-mt-28">
            <h2 id="newsletter-titre" className="eyebrow border-b-2 border-brun pb-2">
              Newsletter
            </h2>
            <form action={updateNewsletter} className="mt-4 space-y-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" name="newsletter" defaultChecked={customer.newsletter} className="mt-1 h-5 w-5 shrink-0 accent-brun" />
                <span>Recevoir les nouvelles créations et actualités de Maison Kayes par e-mail.</span>
              </label>
              <button type="submit" className="btn btn-ghost">
                Enregistrer
              </button>
            </form>
          </section>

          <section id="securite" aria-labelledby="securite-titre" className="scroll-mt-28">
            <h2 id="securite-titre" className="eyebrow border-b-2 border-brun pb-2">
              Mot de passe
            </h2>
            <form action={changePassword} className="mt-4 space-y-4">
              <div>
                <label htmlFor="actuel" className={fieldLabel}>
                  Mot de passe actuel
                </label>
                <input id="actuel" name="actuel" type="password" required autoComplete="current-password" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="nouveau" className={fieldLabel}>
                  Nouveau mot de passe
                </label>
                <input id="nouveau" name="nouveau" type="password" required minLength={10} autoComplete="new-password" className={fieldClass} />
              </div>
              <button type="submit" className="btn btn-ghost">
                Changer le mot de passe
              </button>
            </form>
          </section>

          <section id="suppression" aria-labelledby="suppression-titre" className="scroll-mt-28">
            <details className="border-2 border-dashed border-brun/50 p-4">
              <summary id="suppression-titre" className="cursor-pointer font-semibold">
                Supprimer mon compte
              </summary>
              <form action={deleteAccount} className="mt-4 space-y-3">
                <p className="text-sm">
                  Vos informations de compte (profil, adresse, préférences) sont supprimées. Les commandes déjà passées sont conservées pour nos
                  obligations comptables, sans lien avec un compte.
                </p>
                <div>
                  <label htmlFor="confirmation" className={fieldLabel}>
                    Confirmez avec votre mot de passe
                  </label>
                  <input id="confirmation" name="confirmation" type="password" required autoComplete="current-password" className={fieldClass} />
                </div>
                <button type="submit" className="btn btn-ghost">
                  Supprimer définitivement
                </button>
              </form>
            </details>
          </section>
        </div>
      </div>
    </div>
  );
}
