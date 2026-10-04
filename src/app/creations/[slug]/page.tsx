import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyOnEtsy } from "@/components/EtsyLinks";
import { Frieze } from "@/components/Frieze";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { categories, getProduct, products } from "@/data/products";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/creations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const img = product.images.find((i) => i.width >= 600) ?? product.images[0];
  return pageMetadata({
    title: product.name,
    description: product.description,
    path: `/creations/${product.slug}`,
    image: { url: img.src, width: img.width, height: img.height, alt: img.alt },
  });
}

export default async function ProductPage({ params }: PageProps<"/creations/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = categories[product.category];
  const others = [
    ...products.filter((p) => p.slug !== product.slug && p.category === product.category),
    ...products.filter((p) => p.slug !== product.slug && p.category !== product.category),
  ].slice(0, 3);

  return (
    <>
      <nav aria-label="Fil d’Ariane" className="container-x pt-8">
        <ol className="eyebrow flex flex-wrap items-center gap-2 text-[0.72rem] text-brun-soft">
          <li>
            <Link href="/creations" className="hover:text-brun hover:underline">
              Créations
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/creations?categorie=${product.category}`} className="hover:text-brun hover:underline">
              {category.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-brun">
            {product.name}
          </li>
        </ol>
      </nav>

      <article className="container-x grid gap-10 pb-20 pt-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className="lg:col-span-5 lg:pt-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow text-ocre-ink">{category.singular}</p>
            <h1 className="display mt-3 text-[clamp(2.8rem,6vw,4.75rem)]">{product.name}</h1>
            {product.price && <p className="mt-4 text-2xl font-bold">{product.price}</p>}
            <p className="mt-6 text-lg">{product.description}</p>

            {product.features.length > 0 && (
              <section aria-labelledby="caracteristiques" className="mt-8">
                <h2 id="caracteristiques" className="eyebrow border-b-2 border-brun pb-2">
                  Caractéristiques
                </h2>
                <ul className="mt-1">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-3 border-b border-brun/20 py-2.5">
                      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-orange" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-8">
              <BuyOnEtsy url={product.etsyUrl} productName={product.name} />
            </div>
          </div>
        </div>
      </article>

      <Frieze variant="diamonds" fg="brun" accent="safran" height={22} />

      <section aria-labelledby="autres" className="container-x py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="autres" className="display text-[clamp(2.4rem,6vw,4.5rem)]">
            Autres créations
          </h2>
          <Link href="/creations" className="link-arrow">
            Tout voir <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
