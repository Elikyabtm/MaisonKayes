import Link from "next/link";
import type { Product } from "@/data/products";
import type { Offer, ZoneRate } from "@/lib/shop";
import { ContactInvite } from "./ShopLinks";

/**
 * Bloc d’achat d’une fiche produit. Formulaire HTML classique (fonctionne sans JavaScript) :
 * il envoie la pièce et la zone de livraison à /api/checkout, qui redirige vers Stripe Checkout.
 */
export function BuyBox({ product, offer, zones }: { product: Product; offer: Offer | null; zones: ZoneRate[] }) {
  if (!offer || zones.length === 0) {
    return (
      <ContactInvite
        title="Cette pièce vous intéresse ?"
        text="Elle n’est pas encore disponible à la commande en ligne. Écrivez à Maison Kayes pour en savoir plus."
        productName={product.name}
      />
    );
  }

  if (!offer.available) {
    return (
      <ContactInvite
        title={offer.stock === 0 ? "Cette pièce a trouvé preneur." : "Cette pièce n’est plus disponible."}
        text="Écrivez à Maison Kayes pour savoir si une pièce similaire est prévue."
        productName={product.name}
      />
    );
  }

  return (
    <form action="/api/checkout" method="post" className="border-2 border-brun p-5">
      <input type="hidden" name="slug" value={product.slug} />
      {offer.stock !== null && offer.stock <= 3 && (
        <p className="eyebrow mb-4 inline-block bg-safran px-2 py-1 text-[0.72rem]">
          {offer.stock === 1 ? "Pièce unique · dernière disponible" : `Plus que ${offer.stock} en stock`}
        </p>
      )}
      <fieldset>
        <legend className="eyebrow">Livraison</legend>
        <div className="mt-3 space-y-2">
          {zones.map((z, i) => (
            <label
              key={z.id}
              className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border border-brun/30 px-3 py-2 has-[:checked]:border-brun has-[:checked]:bg-safran/25"
            >
              <span className="flex items-center gap-3">
                <input type="radio" name="zone" value={z.id} defaultChecked={i === 0} required className="h-4 w-4 accent-brun" />
                {z.label}
              </span>
              {z.price && <span className="text-sm font-semibold">{z.price}</span>}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="btn btn-primary mt-5 w-full text-base">
        Commander · {offer.price} <span aria-hidden="true">→</span>
      </button>
      <p className="mt-3 text-sm text-brun-soft">
        Paiement sécurisé par Stripe. Frais de livraison ajoutés au paiement. En commandant, vous acceptez les{" "}
        <Link href="/conditions-generales-de-vente" className="underline">
          conditions générales de vente
        </Link>
        .
      </p>
    </form>
  );
}
