import Image from "next/image";
import Link from "next/link";
import { Frieze } from "@/components/Frieze";
import { Diamond, Triangle } from "@/components/Shapes";
import { transformationProjects, upcyclingSteps } from "@/data/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Upcycling",
  description:
    "La démarche d’upcycling de Maison Kayes : sélectionner les matières, imaginer de nouvelles associations, transformer et donner une nouvelle vie aux tissus.",
  path: "/upcycling",
  image: {
    url: "/images/upcycling-patchwork-denim.webp",
    width: 1536,
    height: 1024,
    alt: "Mains cousant une pièce de tissu imprimé sur une veste en denim",
  },
});

export default function UpcyclingPage() {
  return (
    <>
      <section aria-labelledby="titre" className="on-dark bg-denim text-creme">
        <div className="container-x grid gap-10 pb-16 pt-14 md:grid-cols-12 md:pb-24 md:pt-20">
          <div className="md:col-span-7">
            <p className="eyebrow text-safran">La démarche</p>
            <h1 id="titre" className="display mt-4 text-[clamp(3.2rem,10vw,8.5rem)]">
              Une matière.
              <br />
              <span className="text-safran">Une nouvelle possibilité.</span>
            </h1>
          </div>
          <div className="self-end md:col-span-4 md:col-start-9">
            <p className="text-lg text-creme/90 md:text-xl">
              L’upcycling consiste à transformer une matière existante pour lui donner une nouvelle forme et un nouvel
              usage. C’est l’une des façons dont Maison Kayes conçoit ses pièces.
            </p>
          </div>
        </div>
        <figure className="container-x pb-16 md:pb-24">
          <div className="relative aspect-[4/3] w-full md:aspect-[21/9]">
            <Image
              src="/images/upcycling-patchwork-denim.webp"
              alt="Mains épinglant une pièce de tissu imprimé brun et ocre sur une veste en denim, ciseaux et fil à proximité"
              fill
              priority
              sizes="(min-width: 90rem) 84rem, 100vw"
              className="object-cover object-[50%_45%]"
            />
          </div>
          <figcaption className="mt-3 text-sm text-creme/75">Illustration d’ambiance.</figcaption>
        </figure>
      </section>

      <Frieze variant="triangles" fg="denim" accent="safran" height={22} />

      <section aria-labelledby="etapes" className="container-x py-20 md:py-28">
        <h2 id="etapes" className="display max-w-4xl text-[clamp(2.8rem,7vw,6rem)]">
          De la matière à la pièce.
        </h2>
        <ol className="mt-14 grid gap-0 md:grid-cols-2 lg:grid-cols-4">
          {upcyclingSteps.map((step, i) => (
            <li
              key={step.title}
              className={`relative border-t-2 border-brun pb-10 pt-6 md:pr-8 ${i % 2 === 1 ? "lg:mt-20" : ""}`}
            >
              <span className="display block text-[5.5rem] leading-none text-ocre" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="mt-4 text-2xl font-bold leading-tight [font-stretch:85%]">
                <span className="sr-only">Étape {i + 1} : </span>
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs text-brun-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="regard" className="relative overflow-hidden bg-safran">
        <Triangle className="pointer-events-none absolute -right-10 bottom-0 hidden h-56 w-64 text-orange md:block" />
        <div className="container-x relative grid gap-8 py-20 md:grid-cols-12 md:py-24">
          <h2 id="regard" className="display md:col-span-6 text-[clamp(2.6rem,6vw,5rem)]">
            Rien ne se perd. Tout se réinvente.
          </h2>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-lg">
              Un tissu, une chute, une matière laissée de côté peuvent devenir le point de départ d’une nouvelle pièce.
              Le contraste entre les matières devient alors une signature.
            </p>
            <Link href="/creations" className="btn btn-primary mt-8">
              Voir les créations <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {transformationProjects.length > 0 && (
        <section aria-labelledby="projets" className="container-x py-20 md:py-28">
          <h2 id="projets" className="display text-[clamp(2.6rem,6vw,5rem)]">
            Projets de transformation
          </h2>
          <ul className="mt-12 grid gap-12 md:grid-cols-2">
            {transformationProjects.map((p) => (
              <li key={p.slug}>
                <article>
                  <div className="grid grid-cols-2 gap-3">
                    {p.images.slice(0, 2).map((img) => (
                      <div key={img.src} className="relative aspect-[4/5] bg-creme-deep">
                        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 48rem) 25vw, 50vw" className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <h3 className="mt-5 flex items-center gap-3 text-2xl font-bold [font-stretch:85%]">
                    <Diamond className="h-3 w-3 text-orange" />
                    {p.title}
                  </h3>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    <dt className="eyebrow text-[0.7rem]">Matières</dt>
                    <dd>{p.materials}</dd>
                    <dt className="eyebrow text-[0.7rem]">Pièce</dt>
                    <dd>{p.result}</dd>
                  </dl>
                  <p className="mt-3">{p.description}</p>
                  {p.productSlug && (
                    <Link href={`/creations/${p.productSlug}`} className="link-arrow mt-4">
                      Voir la pièce <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
