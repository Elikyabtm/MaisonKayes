import Link from "next/link";
import { site } from "@/data/site";

/**
 * Lien vers la boutique Etsy. Tant que `site.etsyShopUrl` n’est pas renseigné,
 * le bouton mène à la page Contact (aucun faux lien externe).
 */
export function EtsyShopButton({ className = "btn btn-orange", onClick }: { className?: string; onClick?: () => void }) {
  if (site.etsyShopUrl) {
    return (
      <a href={site.etsyShopUrl} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        Boutique Etsy <span aria-hidden="true">↗</span>
        <span className="sr-only">(ouvre un nouvel onglet)</span>
      </a>
    );
  }
  return (
    <Link href="/contact" className={className} onClick={onClick} title="La boutique Etsy sera bientôt en ligne — contactez-nous">
      Boutique Etsy
      <span className="text-[0.7em] font-semibold normal-case tracking-normal opacity-80">(bientôt)</span>
      <span className="sr-only"> : en attendant, nous contacter</span>
    </Link>
  );
}

/** Bouton d’achat d’une fiche produit. */
export function BuyOnEtsy({ url, productName }: { url: string | null; productName: string }) {
  if (url) {
    return (
      <div className="space-y-3">
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full text-base sm:w-auto sm:min-w-72">
          Acheter sur Etsy <span aria-hidden="true">↗</span>
          <span className="sr-only">: {productName} (ouvre un nouvel onglet)</span>
        </a>
        <p className="text-sm text-brun-soft">L’achat et le paiement s’effectuent sur Etsy.</p>
      </div>
    );
  }
  return (
    <div className="border-2 border-brun bg-safran/25 p-5">
      <p className="font-semibold">Cette pièce vous intéresse ?</p>
      <p className="mt-1 text-sm">
        Sa fiche Etsy n’est pas encore en ligne. Contactez Maison Kayes pour en savoir plus sur sa disponibilité.
      </p>
      <Link href="/contact" className="btn btn-primary mt-4">
        Contacter la marque <span aria-hidden="true">→</span>
      </Link>
      <p className="mt-3 text-sm text-brun-soft">L’achat et le paiement s’effectuent sur Etsy.</p>
    </div>
  );
}
