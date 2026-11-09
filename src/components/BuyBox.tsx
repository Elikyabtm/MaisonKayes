import Link from "next/link";
import { hasVisibleVariants, type CatalogProduct, type CatalogVariant } from "@/data/catalog-types";
import type { ZoneRate } from "@/lib/shop";
import { ContactInvite } from "./ShopLinks";

const stockHint = (v: CatalogVariant) => {
  if (v.stock === null) return "Bientôt disponible";
  if (v.stock === 0) return "Épuisé";
  if (v.stock === 1) return "Dernière pièce";
  if (v.stock <= 3) return `Plus que ${v.stock}`;
  return null;
};

/**
 * Bloc d’achat d’une fiche produit. Formulaire HTML classique (fonctionne sans JavaScript) :
 * il envoie la pièce, la variante et la zone de livraison à /api/checkout, qui redirige vers Stripe Checkout.
 */
export function BuyBox({ product, zones }: { product: CatalogProduct; zones: ZoneRate[] }) {
  if (product.soldOut) {
    return (
      <ContactInvite
        title="Cette pièce a trouvé preneur."
        text="Écrivez à Maison Kayes pour savoir si une pièce similaire est prévue."
        productName={product.name}
      />
    );
  }
  if (!product.purchasable || zones.length === 0) {
    return (
      <ContactInvite
        title="Cette pièce vous intéresse ?"
        text="Elle n’est pas encore disponible à la commande en ligne. Écrivez à Maison Kayes pour en savoir plus."
        productName={product.name}
      />
    );
  }

  const showVariants = hasVisibleVariants(product);
  const firstAvailable = product.variants.find((v) => v.available)!;
  const single = !showVariants ? product.variants[0] : null;
  const singleHint = single && stockHint(single);

  return (
    <form action="/api/checkout" method="post" className="border-2 border-brun p-5">
      <input type="hidden" name="slug" value={product.slug} />
      {singleHint && (
        <p className="eyebrow mb-4 inline-block bg-safran px-2 py-1 text-[0.72rem]">
          {single?.stock === 1 ? "Pièce unique · dernière disponible" : singleHint}
        </p>
      )}
      {single ? (
        <input type="hidden" name="variant" value={single.id} />
      ) : (
        <fieldset className="mb-5">
          <legend className="eyebrow">Imprimé</legend>
          <div className="mt-3 space-y-2">
            {product.variants.map((v) => {
              const hint = stockHint(v);
              return (
                <label
                  key={v.id}
                  className={`flex min-h-11 items-center justify-between gap-3 border border-brun/30 px-3 py-2 has-[:checked]:border-brun has-[:checked]:bg-safran/25 ${
                    v.available ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="variant"
                      value={v.id}
                      disabled={!v.available}
                      defaultChecked={v.id === firstAvailable.id}
                      required
                      className="h-4 w-4 accent-brun"
                    />
                    {v.name}
                  </span>
                  {hint && <span className="text-sm font-semibold">{hint}</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
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
        Commander · {product.price} <span aria-hidden="true">→</span>
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
