import { Suspense } from "react";
import { CreationsGrid } from "@/components/CreationsGrid";
import { PageIntro } from "@/components/PageIntro";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { pageMetadata } from "@/lib/metadata";
import { getOffers, type Offer } from "@/lib/shop";

export const metadata = pageMetadata({
  title: "Créations",
  description:
    "Vêtements, accessoires et lingettes textiles Maison Kayes : chapkas, robe à motifs géométriques et pièces Afro Fusion de Maison Kayes.",
  path: "/creations",
});

export const revalidate = 60;

/** Rendu statique sans filtre (avant hydratation ou sans JavaScript). */
function AllProducts({ offers }: { offers: Record<string, Offer> }) {
  return (
    <div>
      <div className="border-y-2 border-brun py-4">
        <p className="eyebrow text-brun-soft">{products.length} pièces</p>
      </div>
      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} offer={offers[p.slug]} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function CreationsPage() {
  const offers = await getOffers();
  return (
    <>
      <PageIntro eyebrow="Le vestiaire" title="Créations">
        <p>
          Vêtements, accessoires et lingettes textiles.{" "}
          {Object.keys(offers).length > 0
            ? "Chaque pièce se découvre ici et se commande directement sur le site, avec paiement sécurisé."
            : "La boutique en ligne ouvre bientôt : pour toute question sur une pièce, contactez la marque."}
        </p>
      </PageIntro>
      <section aria-label="Liste des créations" className="container-x pb-24">
        <Suspense fallback={<AllProducts offers={offers} />}>
          <CreationsGrid offers={offers} />
        </Suspense>
      </section>
    </>
  );
}
