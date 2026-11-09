import Image from "next/image";
import Link from "next/link";
import { Frieze } from "@/components/Frieze";
import { Diamond, Rings } from "@/components/Shapes";
import { about } from "@/data/content";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "À propos",
  description: "Fatoumata Gassama, fondatrice de Maison Kayes, marque de vêtements et accessoires Afro Fusion.",
  path: "/a-propos",
  image: {
    url: "/images/fatoumata-gassama-portrait.webp",
    width: 1122,
    height: 1402,
    alt: "Portrait de Fatoumata Gassama, fondatrice de Maison Kayes",
  },
});

export default function AboutPage() {
  const extra = [
    { id: "parcours", title: "Parcours", body: about.journey },
    { id: "nom", title: "L’histoire du nom", body: about.nameStory ? [about.nameStory] : [] },
    { id: "inspirations", title: "Inspirations", body: about.inspirations },
  ].filter((s) => s.body.length > 0);

  return (
    <>
      <section aria-labelledby="titre" className="container-x grid gap-10 pb-20 pt-14 md:grid-cols-12 md:gap-8 md:pt-20">
        <div className="md:col-span-6 md:pt-8">
          <p className="eyebrow text-ocre-ink">À propos</p>
          <h1 id="titre" className="display mt-4 text-[clamp(3.4rem,10vw,8.5rem)]">
            Fatoumata
            <br />
            Gassama
          </h1>
          <p className="mt-5 inline-block bg-orange px-3 py-1.5 font-bold uppercase tracking-wide [font-stretch:85%]">
            {about.role}
          </p>
          <div className="mt-8 max-w-lg space-y-4 text-lg md:text-xl">
            {about.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <figure className="relative md:col-span-5 md:col-start-8">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src="/images/fatoumata-gassama-portrait.webp"
              alt="Portrait de Fatoumata Gassama, souriante, en gilet à motifs jaunes, bleus et gris, devant un mur ocre"
              fill
              priority
              sizes="(min-width: 48rem) 42vw, 100vw"
              className="object-cover object-[50%_25%]"
            />
          </div>
          <Rings className="absolute -left-8 -top-8 h-20 w-20 text-safran" />
          <figcaption className="mt-3 text-sm text-brun-soft">Fatoumata Gassama, fondatrice de {site.name}.</figcaption>
        </figure>
      </section>

      {extra.length > 0 && (
        <section aria-label="Son histoire" className="container-x grid gap-12 pb-20 md:grid-cols-3">
          {extra.map((s) => (
            <div key={s.id} className="border-t-2 border-brun pt-5">
              <h2 className="display text-4xl">{s.title}</h2>
              <div className="mt-4 space-y-3">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <Frieze variant="diamonds" fg="brun" accent="orange" height={22} />

      <section aria-labelledby="maison" className="bg-safran">
        <div className="container-x grid gap-8 py-20 md:grid-cols-12 md:py-24">
          <h2 id="maison" className="display md:col-span-6 text-[clamp(2.6rem,6vw,5rem)]">
            Afro Fusion, vêtements & accessoires.
          </h2>
          <div className="md:col-span-5 md:col-start-8">
            <p className="flex gap-3 text-lg">
              <Diamond className="mt-2 h-3 w-3 shrink-0 text-brun" />
              Des pièces qui font dialoguer inspirations africaines, création contemporaine et matières réinventées.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/creations" className="btn btn-primary">
                Les créations <span aria-hidden="true">→</span>
              </Link>
              <Link href="/upcycling" className="btn btn-ghost">
                La démarche upcycling
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
