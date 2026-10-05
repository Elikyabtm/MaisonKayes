import Link from "next/link";
import { HalfDisc } from "@/components/Shapes";
import { instagram, site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Une question sur une création Maison Kayes ? Contactez la marque directement.",
  path: "/contact",
});

type Channel = { label: string; value: string; href: string; external?: boolean; raw?: boolean };

export default function ContactPage() {
  const { email, phone, location } = site.contact;
  const ig = instagram();

  const channels: Channel[] = [
    email && { label: "E-mail", value: email, href: `mailto:${email}`, raw: true },
    ig && { label: "Instagram", value: ig.handle, href: ig.url, external: true },
    phone && { label: "Téléphone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    ...site.socials
      .filter((s) => s !== ig)
      .map((s) => ({ label: s.label, value: s.handle, href: s.url, external: true })),
    site.etsyShopUrl && { label: "Etsy", value: "Messagerie de la boutique", href: site.etsyShopUrl, external: true },
  ].filter(Boolean) as Channel[];

  return (
    <>
      <section aria-labelledby="titre" className="relative overflow-hidden bg-orange">
        <HalfDisc className="pointer-events-none absolute -bottom-1 right-[6%] hidden w-72 text-safran md:block" />
        <div className="container-x relative pb-16 pt-14 md:pb-24 md:pt-20">
          <p className="eyebrow">Contact</p>
          <h1 id="titre" className="display mt-4 text-[clamp(3.4rem,11vw,9.5rem)]">
            Une question&nbsp;?
            <br />
            Une envie&nbsp;?
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl">
            Une pièce, une disponibilité, une collaboration : écrivez directement à Maison Kayes.
          </p>
        </div>
      </section>

      <section aria-labelledby="coordonnees" className="container-x py-16 md:py-24">
        <h2 id="coordonnees" className="eyebrow text-ocre-ink">
          Coordonnées
        </h2>

        {channels.length > 0 ? (
          <ul className="mt-6 border-t-2 border-brun">
            {channels.map((c) => (
              <li key={c.href} className="border-b-2 border-brun">
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex flex-col gap-1 py-6 transition-colors hover:bg-safran sm:flex-row sm:items-baseline sm:justify-between sm:px-4"
                >
                  <span className="eyebrow">{c.label}</span>
                  <span className={`display break-all text-[clamp(1.9rem,5vw,3.6rem)] ${c.raw ? "normal-case" : ""}`}>
                    {c.value}{" "}
                    <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                      {c.external ? "↗" : "→"}
                    </span>
                  </span>
                  {c.external && <span className="sr-only">(ouvre un nouvel onglet)</span>}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 max-w-2xl border-2 border-brun p-6 md:p-8">
            <p className="text-lg font-semibold">Les coordonnées de Maison Kayes seront publiées très prochainement.</p>
            <p className="mt-2">
              En attendant, découvrez les <Link href="/creations" className="underline">créations</Link>.
            </p>
          </div>
        )}

        {location && <p className="mt-8 text-lg">{location}</p>}
      </section>

    </>
  );
}
