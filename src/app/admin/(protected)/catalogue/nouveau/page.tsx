import type { Metadata } from "next";
import Link from "next/link";
import { Flash, inputClass, labelClass, PageTitle } from "@/components/admin/ui";
import { categories, categoryIds } from "@/data/categories";
import { createProduct } from "@/lib/admin/actions/catalog";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nouvelle fiche" };

export default async function NewProductPage({ searchParams }: PageProps<"/admin/catalogue/nouveau">) {
  await requireAdmin();
  return (
    <>
      <p className="mb-3">
        <Link href="/admin/catalogue" className="link-arrow text-[0.75rem]">
          <span aria-hidden="true">←</span> Catalogue
        </Link>
      </p>
      <PageTitle title="Nouvelle fiche" />
      <Flash params={await searchParams} />
      <form action={createProduct} className="max-w-xl space-y-4">
        <div>
          <label htmlFor="nom" className={labelClass}>
            Nom
          </label>
          <input id="nom" name="nom" required maxLength={200} className={inputClass} />
          <p className="mt-1 text-sm text-brun-soft">L’adresse de la fiche est créée à partir du nom et ne change plus ensuite.</p>
        </div>
        <div>
          <label htmlFor="categorie" className={labelClass}>
            Catégorie
          </label>
          <select id="categorie" name="categorie" required className={inputClass}>
            {categoryIds.map((c) => (
              <option key={c} value={c}>
                {categories[c].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea id="description" name="description" rows={4} className={`${inputClass} py-2`} />
        </div>
        <p className="text-sm text-brun-soft">
          La fiche est créée masquée. Ajoutez ensuite les photos, le prix et le stock, puis rendez-la visible.
        </p>
        <button type="submit" className="btn btn-primary">
          Créer la fiche
        </button>
      </form>
    </>
  );
}
