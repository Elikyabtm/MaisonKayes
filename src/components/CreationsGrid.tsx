"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CatalogProduct } from "@/data/catalog-types";
import { categories, categoryIds, legacyCategories, type Category } from "@/data/categories";
import { ProductCard } from "./ProductCard";

type Filter = "tout" | Category | "upcycling";

export function filtersFor(products: CatalogProduct[]): { value: Filter; label: string }[] {
  const list: { value: Filter; label: string }[] = [
    { value: "tout", label: "Tout" },
    ...categoryIds.map((id) => ({ value: id, label: categories[id].label })),
  ];
  // Le filtre n’apparaît que si au moins une pièce est confirmée comme upcyclée.
  if (products.some((p) => p.upcycled)) list.push({ value: "upcycling", label: "Upcycling" });
  return list;
}

export function CreationsGrid({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = filtersFor(products);

  const raw = params.get("categorie");
  const requested = (raw && legacyCategories[raw]) ?? raw;
  const active: Filter = filters.some((f) => f.value === requested) ? (requested as Filter) : "tout";

  const visible = products.filter((p) => {
    if (active === "tout") return true;
    if (active === "upcycling") return p.upcycled;
    return p.category === active;
  });

  const select = (value: Filter) => {
    const q = value === "tout" ? "" : `?categorie=${value}`;
    router.replace(`${pathname}${q}`, { scroll: false });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-y-2 border-brun py-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filtrer les créations" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={active === f.value}
              onClick={() => select(f.value)}
              className={`btn min-h-11 px-4 py-2 text-[0.85rem] ${active === f.value ? "btn-primary" : "btn-ghost"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="eyebrow text-brun-soft" aria-live="polite">
          {visible.length} {visible.length > 1 ? "pièces" : "pièce"}
        </p>
      </div>

      {visible.length > 0 ? (
        <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-lg">Aucune pièce dans cette catégorie pour le moment.</p>
      )}
    </div>
  );
}
