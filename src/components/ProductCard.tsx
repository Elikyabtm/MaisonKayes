import Image from "next/image";
import Link from "next/link";
import { categories, type Product } from "@/data/products";
import type { Offer } from "@/lib/shop";

export function ProductCard({
  product,
  offer,
  sizes = "(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw",
  aspect = "aspect-[5/6]",
  headingLevel = "h3",
}: {
  product: Product;
  offer?: Offer;
  sizes?: string;
  aspect?: string;
  headingLevel?: "h2" | "h3";
}) {
  const img = product.images[0];
  const Heading = headingLevel;
  return (
    <article className="group relative flex flex-col">
      <div className={`relative overflow-hidden bg-creme-deep ${aspect}`}>
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes={sizes}
          quality={85}
          className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col border-b-2 border-brun pb-4 pt-4">
        <p className="eyebrow text-ocre-ink">{categories[product.category].label}</p>
        <Heading className="mt-1 text-xl font-bold leading-tight [font-stretch:90%]">
          <Link href={`/creations/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </Heading>
        {offer && (
          <p className="mt-1 flex items-center gap-2 text-brun-soft">
            {offer.price}
            {!offer.available && <span className="eyebrow bg-brun px-1.5 py-0.5 text-[0.65rem] text-creme">Vendu</span>}
          </p>
        )}
        <span className="link-arrow mt-4 self-start" aria-hidden="true">
          Découvrir la pièce <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </article>
  );
}
