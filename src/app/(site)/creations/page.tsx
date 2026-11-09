import { Suspense } from "react";
import { CreationsGrid } from "@/components/CreationsGrid";
import { PageIntro } from "@/components/PageIntro";
import { ProductCard } from "@/components/ProductCard";
import type { CatalogProduct } from "@/data/catalog-types";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { shopIsOpen } from "@/lib/shop";

export const metadata = pageMetadata({
  title: "Créations",
  description:
    "Vêtements, couvre-chefs et accessoires Maison Kayes : chapkas, écharpe cagoule, robe à motifs géométriques, chouchous, boucles d’oreilles et lingettes textiles.",
  path: "/creations",
});

export const revalidate = 60;

/** Rendu statique sans filtre (avant hydratation ou sans JavaScript). */
function AllProducts({ products }: { products: CatalogProduct[] }) {
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

export default async function CreationsPage() {
  const products = await getCatalog();
  const open = (await shopIsOpen()) && products.some((p) => p.purchasable);
  return (
    <>
      <PageIntro eyebrow="Le vestiaire" title="Créations">
        <p>
          Vêtements, couvre-chefs et accessoires.{" "}
          {open
            ? "Chaque pièce se découvre ici et se commande directement sur le site, avec paiement sécurisé."
            : "La boutique en ligne ouvre bientôt : pour toute question sur une pièce, contactez la marque."}
        </p>
      </PageIntro>
      <section aria-label="Liste des créations" className="container-x pb-24">
        <Suspense fallback={<AllProducts products={products} />}>
          <CreationsGrid products={products} />
        </Suspense>
      </section>
    </>
  );
}
