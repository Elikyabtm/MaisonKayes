import Image from "next/image";
import Link from "next/link";
import { Frieze } from "@/components/Frieze";
import { PageIntro } from "@/components/PageIntro";
import { Diamond, HalfDisc, Rings } from "@/components/Shapes";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Notre univers",
  description:
    "L’univers Maison Kayes : un dialogue entre inspirations africaines et création contemporaine, entre imprimés, matières et lumière.",
  path: "/notre-univers",
});

const details = [
  { src: "/images/chapka-verte-detail-breloque.webp", w: 198, h: 335, alt: "Breloque dorée en forme de fleur et de feuilles posée sur une doublure blanche", caption: "La breloque dorée" },
  { src: "/images/chapka-bleue-detail-lien.webp", w: 181, h: 320, alt: "Lien bleu bordé de tissu imprimé jaune et noir", caption: "Le lien imprimé" },
  { src: "/images/lingettes-textiles-detail.webp", w: 165, h: 359, alt: "Bords superposés de lingettes : tissu imprimé et éponge turquoise", caption: "L’imprimé et l’éponge" },
  { src: "/images/chapka-verte-detail-lien.webp", w: 170, h: 335, alt: "Lien à imprimé camouflage vert et brun", caption: "Le camouflage" },
];

export default function UniversPage() {
  return (
    <>
      <PageIntro eyebrow="Notre univers" title="Des inspirations qui se rencontrent.">
        <p>
          Chez Maison Kayes, les imprimés graphiques croisent des coupes actuelles, et les matières se répondent.
          L’Afro Fusion, c’est cette rencontre : un héritage qui se porte au présent.
        </p>
      </PageIntro>

      {/* Composition 1 : la matière */}
      <section aria-labelledby="matiere" className="container-x grid gap-8 pb-20 md:grid-cols-12 md:gap-6 md:pb-28">
        <div className="relative aspect-[4/5] md:col-span-6 md:aspect-auto md:min-h-[36rem]">
          <Image
            src="/images/chapka-marbree-produit.webp"
            alt="Gros plan sur une chapka : tissu marbré bleu nuit, brique et blanc rencontrant une matière bouclée camouflage"
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover object-[50%_40%]"
          />
        </div>
        <div className="flex flex-col justify-between gap-10 md:col-span-5 md:col-start-8">
          <div>
            <p className="eyebrow text-ocre-ink">01 — La matière</p>
            <h2 id="matiere" className="display mt-4 text-[clamp(2.6rem,6vw,5rem)]">
              Un motif répond à une texture.
            </h2>
            <p className="mt-6 max-w-md text-lg">
              Un tissu marbré rencontre une doublure bouclée, un imprimé géométrique s’associe à une matière douce.
              Chaque pièce naît d’un contraste assumé.
            </p>
          </div>
          <figure className="w-40 self-end md:w-48">
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/ambiance-textiles.webp"
                alt="Tissus indigo à motifs blancs suspendus au soleil (image d’ambiance)"
                fill
                sizes="12rem"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-sm text-brun-soft">Image d’ambiance.</figcaption>
          </figure>
        </div>
      </section>

      {/* Aplat orange */}
      <section aria-labelledby="trois-mots" className="relative overflow-hidden bg-orange">
        <Rings className="pointer-events-none absolute -left-16 -top-16 hidden h-64 w-64 text-brun/15 md:block" />
        <div className="container-x relative py-16 md:py-24">
          <h2 id="trois-mots" className="sr-only">
            Trois mots pour l’univers Maison Kayes
          </h2>
          <dl className="grid gap-10 md:grid-cols-3 md:gap-6">
            {[
              ["Héritage", "Des inspirations africaines, comme point de départ et comme langage."],
              ["Mouvement", "Des pièces pensées pour être portées aujourd’hui, au quotidien."],
              ["Réinvention", "Des matières qui changent de forme et trouvent une nouvelle place."],
            ].map(([term, def], i) => (
              <div key={term} className={`border-t-2 border-brun pt-4 ${i === 1 ? "md:mt-16" : ""} ${i === 2 ? "md:mt-32" : ""}`}>
                <dt className="display text-[clamp(2.6rem,5vw,4.2rem)]">{term}</dt>
                <dd className="mt-3 max-w-xs text-lg">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Composition 2 : lumière et terre */}
      <section aria-labelledby="lumiere" className="container-x grid gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <p className="eyebrow text-ocre-ink">02 — La couleur</p>
          <h2 id="lumiere" className="display mt-4 text-[clamp(2.6rem,6vw,5rem)]">
            Terre, ocre, safran.
          </h2>
          <p className="mt-6 max-w-md text-lg">
            Les teintes de la marque viennent de la terre et de la lumière : des ocres chauds, des orangés francs, un
            jaune safran, ponctués de bleu profond.
          </p>
          <ul className="mt-8 flex gap-2" aria-label="Palette Maison Kayes">
            {[
              ["bg-brun", "Brun profond"],
              ["bg-ocre", "Ocre"],
              ["bg-orange", "Orange"],
              ["bg-safran", "Safran"],
              ["bg-denim", "Bleu denim"],
            ].map(([c, label]) => (
              <li key={label} className="flex flex-col gap-2">
                <span className={`block h-14 w-12 border border-brun/20 sm:w-16 ${c}`} aria-hidden="true" />
                <span className="text-xs">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative grid grid-cols-2 items-start gap-4 md:col-span-6 md:col-start-7">
          <figure className="mt-16">
            <div className="relative aspect-[3/4]">
              <Image
                src="/images/ambiance-architecture.webp"
                alt="Architecture de terre crue et palmier sous un ciel bleu (image d’ambiance)"
                fill
                sizes="(min-width: 48rem) 22vw, 45vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-sm text-brun-soft">Image d’ambiance.</figcaption>
          </figure>
          <figure>
            <div className="relative aspect-[3/5]">
              <Image
                src="/images/ambiance-paysage.webp"
                alt="Paysage au coucher du soleil, palmiers et bâtiments ocre (image d’ambiance)"
                fill
                sizes="(min-width: 48rem) 22vw, 45vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-sm text-brun-soft">Image d’ambiance.</figcaption>
          </figure>
          <Diamond className="absolute -bottom-4 left-[46%] h-8 w-8 text-orange" />
        </div>
      </section>

      <Frieze variant="steps" fg="ocre" accent="brun" height={20} />

      {/* Détails de matières */}
      <section aria-labelledby="details" className="bg-creme-deep py-20 md:py-28">
        <div className="container-x">
          <p className="eyebrow text-ocre-ink">03 — Les détails</p>
          <h2 id="details" className="display mt-4 max-w-3xl text-[clamp(2.6rem,6vw,5rem)]">
            Ce qui fait la différence.
          </h2>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">
            {details.map((d, i) => (
              <li key={d.src} className={i % 2 === 1 ? "md:mt-12" : ""}>
                <figure>
                  <div className="relative mx-auto aspect-[1/2]" style={{ maxWidth: d.w * 1.6 }}>
                    <Image src={d.src} alt={d.alt} fill sizes="(min-width: 48rem) 20vw, 45vw" quality={85} className="object-cover" />
                  </div>
                  <figcaption className="eyebrow mt-3 text-[0.75rem]">{d.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Conclusion */}
      <section aria-labelledby="porter" className="container-x grid items-end gap-0 py-20 md:grid-cols-12 md:py-28">
        <div className="relative aspect-[4/5] md:col-span-6 md:col-start-6 md:row-start-1">
          <Image
            src="/images/chapka-marbree-portee.webp"
            alt="Mannequin portant une chapka Maison Kayes dans une lumière dorée"
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>
        <div className="relative z-10 -mt-16 mr-6 bg-safran p-6 sm:p-10 md:col-span-6 md:col-start-1 md:row-start-1 md:mb-16 md:mr-0 md:mt-0">
          <HalfDisc className="mb-4 w-14 text-brun" />
          <h2 id="porter" className="display text-[clamp(2.4rem,5.5vw,4.4rem)]">Un héritage qui se porte.</h2>
          <Link href="/creations" className="btn btn-primary mt-6">
            Voir les créations <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
