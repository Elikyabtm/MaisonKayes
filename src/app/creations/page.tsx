import { Suspense } from "react";
import { CreationsGrid } from "@/components/CreationsGrid";
import { PageIntro } from "@/components/PageIntro";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Créations",
  description:
    "Vêtements, accessoires et lingettes textiles Maison Kayes : chapkas, robe à motifs géométriques et pièces Afro Fusion, disponibles sur Etsy.",
  path: "/creations",
});

/** Rendu statique sans filtre (avant hydratation ou sans JavaScript). */
function AllProducts() {
  return (
    <div>
      <div className="border-y-2 border-brun py-4">
        <p className="eyebrow text-brun-soft">{products.length} pièces</p>
      </div>
      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CreationsPage() {
  return (
    <>
      <PageIntro eyebrow="Le vestiaire" title="Créations">
        <p>
          Vêtements, accessoires et lingettes textiles. Chaque pièce se découvre ici et s’achète sur Etsy.
        </p>
      </PageIntro>
      <section aria-label="Liste des créations" className="container-x pb-24">
        <Suspense fallback={<AllProducts />}>
          <CreationsGrid />
        </Suspense>
      </section>
    </>
  );
}
