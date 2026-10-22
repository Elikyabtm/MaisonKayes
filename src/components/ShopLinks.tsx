import Link from "next/link";
import { instagram, site } from "@/data/site";

/** Bouton d’accès à la boutique (liste des créations). */
export function ShopButton({ className = "btn btn-orange", onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link href="/creations" className={className} onClick={onClick}>
      La boutique <span aria-hidden="true">→</span>
    </Link>
  );
}

/** Invitation à contacter la marque (pièce non disponible à la commande en ligne). */
export function ContactInvite({ title, text, productName }: { title: string; text: string; productName: string }) {
  const { email } = site.contact;
  const ig = instagram();
  return (
    <div className="border-2 border-brun bg-safran/25 p-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{text}</p>
      <div className="mt-4 flex flex-col gap-2 xs:flex-row xs:flex-wrap">
        {email ? (
          <a href={`mailto:${email}?subject=${encodeURIComponent(productName)}`} className="btn btn-primary">
            Écrire à la marque <span aria-hidden="true">→</span>
          </a>
        ) : (
          <Link href="/contact" className="btn btn-primary">
            Contacter la marque <span aria-hidden="true">→</span>
          </Link>
        )}
        {ig && (
          <a href={ig.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            {ig.handle} <span aria-hidden="true">↗</span>
            <span className="sr-only">(Instagram, ouvre un nouvel onglet)</span>
          </a>
        )}
      </div>
    </div>
  );
}
