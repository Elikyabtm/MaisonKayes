import Image from "next/image";
import Link from "next/link";
import { EtsyShopButton } from "@/components/EtsyLinks";
import { Frieze } from "@/components/Frieze";
import { Marquee } from "@/components/Marquee";
import { ProductCard } from "@/components/ProductCard";
import { Diamond, HalfDisc, Rings, Triangle } from "@/components/Shapes";
import { about } from "@/data/content";
import { getProduct, homeSelection, type Product } from "@/data/products";
import { instagram } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  description:
    "Maison Kayes, marque Afro Fusion de Fatoumata Gassama : vêtements et accessoires qui font dialoguer inspirations africaines, création contemporaine et matières réinventées.",
  path: "/",
});

export default function HomePage() {
  const selection = homeSelection.map(getProduct).filter(Boolean) as Product[];
  const ig = instagram();

  return (
    <>
      {/* ——— Premier écran ——— */}
      <section aria-labelledby="hero-title" className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-auto lg:h-[calc(100svh-4.25rem-2px)] lg:max-h-[56rem] lg:min-h-[36rem]">
          <Image
            src="/images/robe-geometrique-mise-en-scene.webp"
            alt="Mannequin portant la robe Maison Kayes à motifs géométriques, dans une cour baignée de lumière ocre"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover object-[88%_50%] sm:object-[80%_50%] lg:object-[72%_50%]"
          />
        </div>

        <div className="container-x relative lg:absolute lg:inset-0 lg:flex lg:items-center">
          <div className="relative -mt-10 bg-creme pt-8 sm:-mt-16 sm:max-w-xl sm:pr-8 lg:mt-0 lg:max-w-[46%] lg:bg-transparent lg:p-0">
            <h1 id="hero-title" className="display reveal text-[clamp(4.2rem,19vw,10.5rem)] text-brun lg:text-[clamp(6rem,10.5vw,11rem)]">
              Afro
              <br />
              Fusion
            </h1>
            <p className="display reveal mt-4 inline-block bg-orange px-3 py-2 text-[clamp(1.5rem,4.6vw,2.6rem)] text-brun [animation-delay:120ms]">
              Héritage en mouvement.
            </p>
            <p className="reveal mt-6 max-w-md text-lg font-medium [animation-delay:200ms] md:text-xl">
              Des vêtements et accessoires qui font dialoguer inspirations africaines, création contemporaine et
              matières réinventées.
            </p>
            <div className="reveal mt-8 flex flex-col gap-3 [animation-delay:280ms] xs:flex-row xs:flex-wrap">
              <Link href="/creations" className="btn btn-primary">
                Découvrir les créations <span aria-hidden="true">→</span>
              </Link>
              <Link href="/notre-univers" className="btn btn-ghost bg-creme/70">
                Notre univers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Marquee className="mt-14 lg:mt-0" />

      {/* ——— Les créations ——— */}
      <section aria-labelledby="univers-title" className="container-x py-20 md:py-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="univers-title" className="display text-[clamp(3rem,9vw,7rem)]">
            Les
            <br className="hidden md:block" /> créations
          </h2>
          <p className="max-w-sm text-lg">Trois portes d’entrée dans l’univers Maison Kayes.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-12 md:grid-rows-[auto_auto]">
          <CollectionTile
            href="/creations?categorie=accessoires"
            title="Accessoires"
            label="Chapkas & pièces à porter"
            image={{
              src: "/images/chapka-marbree-portee.webp",
              alt: "Mannequin portant une chapka Maison Kayes au tissu marbré et à la doublure camouflage",
              position: "50% 30%",
            }}
            className="aspect-[4/5] md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[44rem]"
            sizes="(min-width: 48rem) 58vw, 100vw"
            tag="bg-orange text-brun"
          />
          <CollectionTile
            href="/creations?categorie=vetements"
            title="Vêtements"
            label="Imprimés graphiques"
            image={{
              src: "/images/robe-geometrique-mise-en-scene.webp",
              alt: "Robe à motifs géométriques portée, cadrage serré sur la silhouette",
              position: "71% 40%",
            }}
            className="aspect-[4/5] md:col-span-5 md:aspect-[5/4]"
            sizes="(min-width: 48rem) 40vw, 100vw"
            tag="bg-safran text-brun"
          />
          <CollectionTile
            href="/upcycling"
            title="Upcycling"
            label="La démarche"
            image={{
              src: "/images/upcycling-patchwork-denim.webp",
              alt: "Mains cousant une pièce de tissu imprimé sur une veste en denim (visuel d’ambiance)",
              position: "50% 50%",
            }}
            className="aspect-[4/3] md:col-span-5 md:aspect-auto md:min-h-[20rem]"
            sizes="(min-width: 48rem) 40vw, 100vw"
            tag="bg-denim text-creme"
          />
        </div>
      </section>

      <Frieze variant="triangles" fg="brun" accent="orange" height={22} />

      {/* ——— Sélection ——— */}
      <section aria-labelledby="selection-title" className="relative overflow-hidden py-20 md:py-28">
        <Rings className="pointer-events-none absolute -right-24 top-10 hidden h-72 w-72 text-safran md:block" />
        <div className="container-x relative">
          <p className="eyebrow text-ocre-ink">Sélection</p>
          <h2 id="selection-title" className="display mt-3 text-[clamp(2.8rem,8vw,6rem)]">
            Pièces choisies
          </h2>
          <ul className="mt-12 grid gap-x-5 gap-y-12 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {selection.map((p, i) => (
              <li key={p.id} className={i % 2 === 1 ? "lg:mt-20" : ""}>
                <ProductCard product={p} sizes="(min-width: 64rem) 20vw, (min-width: 48rem) 32vw, (min-width: 26rem) 48vw, 92vw" />
              </li>
            ))}
          </ul>
          <div className="mt-14">
            <Link href="/creations" className="btn btn-ghost">
              Toutes les créations <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Upcycling ——— */}
      <section aria-labelledby="upcycling-title" className="on-dark relative bg-denim text-creme">
        <div className="container-x grid items-center gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <p className="eyebrow text-safran">Upcycling</p>
            <h2 id="upcycling-title" className="display mt-4 text-[clamp(3rem,7.5vw,6.2rem)]">
              Rien ne se perd.
              <br />
              <span className="text-safran">Tout se réinvente.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-creme/90">
              Une matière peut changer de forme, de fonction, d’histoire. Maison Kayes associe, transforme et assemble
              pour donner aux tissus une nouvelle possibilité.
            </p>
            <Link href="/upcycling" className="link-arrow mt-8 text-creme">
              Découvrir la démarche <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className="relative md:col-span-7">
            <div className="relative aspect-[3/2] w-full">
              <Image
                src="/images/upcycling-patchwork-denim.webp"
                alt="Mains épinglant une pièce de tissu imprimé brun et ocre sur une veste en denim"
                fill
                sizes="(min-width: 48rem) 55vw, 100vw"
                className="object-cover"
              />
            </div>
            <Diamond className="absolute -left-5 -top-5 h-10 w-10 text-safran" />
            <figcaption className="mt-3 text-sm text-creme/75">Visuel d’ambiance.</figcaption>
          </figure>
        </div>
      </section>

      {/* ——— Manifeste ——— */}
      <section aria-labelledby="manifeste-title" className="relative overflow-hidden bg-orange text-brun">
        <HalfDisc className="pointer-events-none absolute -bottom-1 right-[8%] hidden w-64 text-safran md:block" />
        <div className="container-x relative py-20 md:py-32">
          <p className="eyebrow">Manifeste</p>
          <h2 id="manifeste-title" className="display mt-6 text-[clamp(2.9rem,10.5vw,9.5rem)]">
            <span className="block">Entre héritage</span>
            <span className="block md:pl-[12%]">et modernité,</span>
            <span className="mt-2 inline-block bg-brun px-3 pb-1 pt-2 text-creme md:ml-[4%]">on crée avec les deux.</span>
          </h2>
        </div>
      </section>

      {/* ——— La créatrice ——— */}
      <section aria-labelledby="creatrice-title" className="container-x grid gap-10 py-20 md:grid-cols-12 md:items-end md:py-28">
        <div className="relative md:col-span-5">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src="/images/fatoumata-gassama-portrait.webp"
              alt="Portrait de Fatoumata Gassama, fondatrice de Maison Kayes, souriante devant un mur ocre"
              fill
              sizes="(min-width: 48rem) 40vw, 100vw"
              className="object-cover object-[50%_25%]"
            />
          </div>
          <Triangle className="absolute -bottom-6 right-3 h-16 w-16 text-safran md:-right-6" />
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pb-6">
          <p className="eyebrow text-ocre-ink">La créatrice</p>
          <h2 id="creatrice-title" className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">
            Fatoumata
            <br />
            Gassama
          </h2>
          <p className="mt-2 font-semibold">{about.role}</p>
          <p className="mt-6 max-w-lg text-lg">{about.intro[0]}</p>
          <Link href="/a-propos" className="link-arrow mt-8">
            À propos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ——— Invitation ——— */}
      <section aria-labelledby="cta-title" className="border-t-2 border-brun bg-safran">
        <div className="container-x flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <h2 id="cta-title" className="display max-w-3xl text-[clamp(2.6rem,6.5vw,5rem)]">
            Les pièces vous attendent sur Etsy.
          </h2>
          <div className="flex flex-col gap-3 xs:flex-row">
            <EtsyShopButton className="btn btn-primary" />
            {ig ? (
              <a href={ig.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Suivre {ig.handle} <span aria-hidden="true">↗</span>
                <span className="sr-only">(Instagram, ouvre un nouvel onglet)</span>
              </a>
            ) : (
              <Link href="/contact" className="btn btn-ghost">
                Nous écrire
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CollectionTile({
  href,
  title,
  label,
  image,
  className,
  sizes,
  tag,
}: {
  href: string;
  title: string;
  label: string;
  image: { src: string; alt: string; position: string };
  className: string;
  sizes: string;
  tag: string;
}) {
  return (
    <Link href={href} className={`group relative block overflow-hidden bg-creme-deep ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        style={{ objectPosition: image.position }}
      />
      <span className={`absolute bottom-0 left-0 flex flex-col px-5 pb-4 pt-3 ${tag}`}>
        <span className="eyebrow text-[0.72rem]">{label}</span>
        <span className="display text-[clamp(2.2rem,4.5vw,3.6rem)]">
          {title} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </span>
    </Link>
  );
}
