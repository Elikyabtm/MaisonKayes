import Link from "next/link";
import { legalNav, mainNav, site } from "@/data/site";
import { EtsyShopButton } from "./EtsyLinks";
import { Frieze } from "./Frieze";
import { Logo } from "./Logo";

export function Footer() {
  const { email, phone, location } = site.contact;
  const hasContact = Boolean(email || phone || location);
  return (
    <footer className="on-dark bg-brun text-creme">
      <Frieze variant="steps" fg="orange" accent="safran" bg="brun" height={20} />
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-creme/80">
            Vêtements & accessoires Afro Fusion, entre héritage et matières réinventées.
          </p>
          <div className="mt-6">
            <EtsyShopButton />
          </div>
        </div>

        <nav aria-label="Plan du site" className="md:col-span-3">
          <h2 className="eyebrow text-safran">Navigation</h2>
          <ul className="mt-4 space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-safran hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="eyebrow text-safran">Contact</h2>
          {hasContact ? (
            <ul className="mt-4 space-y-2">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="break-all hover:text-safran hover:underline">
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-safran hover:underline">
                    {phone}
                  </a>
                </li>
              )}
              {location && <li className="text-creme/80">{location}</li>}
            </ul>
          ) : (
            <p className="mt-4 text-creme/80">
              <Link href="/contact" className="underline hover:text-safran">
                Écrire à Maison Kayes
              </Link>
            </p>
          )}
          {site.socials.length > 0 && (
            <>
              <h2 className="eyebrow mt-8 text-safran">Réseaux</h2>
              <ul className="mt-4 space-y-2">
                {site.socials.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-safran hover:underline">
                      {s.label} — {s.handle} <span aria-hidden="true">↗</span>
                      <span className="sr-only">(ouvre un nouvel onglet)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <nav aria-label="Informations légales" className="md:col-span-2">
          <h2 className="eyebrow text-safran">Légal</h2>
          <ul className="mt-4 space-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-safran hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-creme/20">
        <div className="container-x flex flex-col gap-2 py-6 text-sm text-creme/75 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Tous droits réservés.</p>
          <p>{site.credit}</p>
        </div>
      </div>
    </footer>
  );
}
