import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Flash, inputClass, labelClass, PageTitle, StockBadge } from "@/components/admin/ui";
import { categories, categoryIds } from "@/data/categories";
import { DEFAULT_VARIANT } from "@/data/catalog-types";
import {
  addVariant,
  deletePhoto,
  deleteVariant,
  movePhoto,
  moveVariant,
  saveVariants,
  updatePhoto,
  updateProduct,
  uploadPhotos,
} from "@/lib/admin/actions/catalog";
import { kindLabels, stockLevel } from "@/lib/admin/labels";
import { getProductAdmin } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Modifier la fiche" };

const priceInput = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2).replace(".", ","));

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/catalogue/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const p = await getProductAdmin(id);
  if (!p) notFound();
  const sp = await searchParams;
  const activeVariants = p.variants.filter((v) => v.active);

  return (
    <>
      <p className="mb-3">
        <Link href="/admin/catalogue" className="link-arrow text-[0.75rem]">
          <span aria-hidden="true">←</span> Catalogue
        </Link>
      </p>
      <PageTitle title={p.name}>
        {p.visible ? <Badge kind="ok">Visible</Badge> : <Badge kind="dark">Masquée</Badge>}
        {p.visible && (
          <a href={`/creations/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-10 px-3 py-1.5 text-[0.75rem]">
            Voir la fiche <span aria-hidden="true">↗</span>
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        )}
      </PageTitle>
      <Flash params={sp} />

      {/* ——— Informations ——— */}
      <section aria-labelledby="infos" className="border-2 border-brun p-4 md:p-6">
        <h2 id="infos" className="display text-2xl">
          Informations
        </h2>
        <form action={updateProduct} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={p.id} />
          <div>
            <label htmlFor="nom" className={labelClass}>
              Nom
            </label>
            <input id="nom" name="nom" required maxLength={200} defaultValue={p.name} className={inputClass} />
            <p className="mt-1 text-sm text-brun-soft">Adresse : /creations/{p.slug}</p>
          </div>
          <div>
            <label htmlFor="categorie" className={labelClass}>
              Catégorie
            </label>
            <select id="categorie" name="categorie" defaultValue={p.category} className={inputClass}>
              {categoryIds.map((c) => (
                <option key={c} value={c}>
                  {categories[c].label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea id="description" name="description" rows={4} defaultValue={p.description} className={`${inputClass} py-2`} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="caracteristiques" className={labelClass}>
              Caractéristiques (une par ligne)
            </label>
            <textarea id="caracteristiques" name="caracteristiques" rows={4} defaultValue={p.features.join("\n")} className={`${inputClass} py-2`} />
          </div>
          <div>
            <label htmlFor="prix" className={labelClass}>
              Prix TTC (€)
            </label>
            <input id="prix" name="prix" inputMode="decimal" placeholder="ex. 25,00" defaultValue={priceInput(p.priceCents)} className={inputClass} />
            <p className="mt-1 text-sm text-brun-soft">Laisser vide : la pièce reste visible mais ne peut pas être commandée.</p>
          </div>
          <fieldset className="space-y-2 self-start">
            <legend className={labelClass}>Publication</legend>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" name="visible" defaultChecked={p.visible} className="h-5 w-5 accent-brun" />
              Fiche visible sur le site
            </label>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" name="upcycle" defaultChecked={p.upcycled} className="h-5 w-5 accent-brun" />
              Pièce upcyclée (confirmée)
            </label>
          </fieldset>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              Enregistrer la fiche
            </button>
          </div>
        </form>
      </section>

      {/* ——— Variantes ——— */}
      <section id="variantes" aria-labelledby="variantes-titre" className="mt-8 scroll-mt-32 border-2 border-brun p-4 md:p-6">
        <h2 id="variantes-titre" className="display text-2xl">
          Variantes
        </h2>
        <p className="mt-1 text-sm text-brun-soft">
          Une pièce sans déclinaison garde une seule variante « {DEFAULT_VARIANT} », non affichée sur le site. Les quantités se gèrent dans{" "}
          <Link href="/admin/stocks" className="underline">
            Stocks
          </Link>
          .
        </p>
        <form id="variante-deplacer" action={moveVariant} />
        <form id="variante-supprimer" action={deleteVariant} />
        <form action={saveVariants} className="mt-4">
          <input type="hidden" name="id" value={p.id} />
          <ul>
            {p.variants.map((v, i) => (
              <li key={v.id} className="grid grid-cols-[1fr_auto] items-end gap-2 border-b border-brun/20 py-3 sm:grid-cols-[1fr_auto_auto_auto]">
                <div>
                  <label htmlFor={`nom_${v.id}`} className={labelClass}>
                    Nom de la variante
                  </label>
                  <input id={`nom_${v.id}`} name={`nom_${v.id}`} defaultValue={v.name} maxLength={120} className={inputClass} />
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-brun-soft">
                    <StockBadge level={stockLevel(v.stock, v.lowStockThreshold)} />
                    {v.stock !== null && `${v.stock} en stock`}
                    {v.sold > 0 && ` · vendue ${v.sold} fois`}
                  </span>
                </div>
                <label className="flex min-h-11 items-center gap-2 self-start pt-6 text-sm">
                  <input type="checkbox" name={`active_${v.id}`} defaultChecked={v.active} className="h-5 w-5 accent-brun" />
                  Active
                </label>
                <span className="col-span-2 flex gap-1 sm:col-span-1">
                  <button
                    type="submit"
                    form="variante-deplacer"
                    name="cmd"
                    value={`${v.id}:haut`}
                    disabled={i === 0}
                    className="btn btn-ghost min-h-11 min-w-11 px-2 disabled:opacity-30"
                    aria-label={`Monter « ${v.name} »`}
                  >
                    ↑
                  </button>
                  <button
                    type="submit"
                    form="variante-deplacer"
                    name="cmd"
                    value={`${v.id}:bas`}
                    disabled={i === p.variants.length - 1}
                    className="btn btn-ghost min-h-11 min-w-11 px-2 disabled:opacity-30"
                    aria-label={`Descendre « ${v.name} »`}
                  >
                    ↓
                  </button>
                </span>
                <button
                  type="submit"
                  form="variante-supprimer"
                  name="variante"
                  value={v.id}
                  disabled={v.sold > 0 || (v.active && activeVariants.length === 1)}
                  title={v.sold > 0 ? "Déjà vendue : désactivez-la plutôt" : undefined}
                  className="btn btn-ghost col-span-2 min-h-11 px-3 text-[0.75rem] disabled:opacity-30 sm:col-span-1"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
          <button type="submit" className="btn btn-primary mt-4 w-full sm:w-auto">
            Enregistrer les variantes
          </button>
        </form>
        <form action={addVariant} className="mt-6 flex flex-col gap-2 border-t-2 border-brun pt-4 sm:flex-row sm:items-end">
          <input type="hidden" name="id" value={p.id} />
          <div className="flex-1">
            <label htmlFor="nouvelle-variante" className={labelClass}>
              Ajouter une variante
            </label>
            <input id="nouvelle-variante" name="nom" required maxLength={120} placeholder="ex. Bleu roi à motifs dorés" className={inputClass} />
          </div>
          <button type="submit" className="btn btn-ghost min-h-11">
            Ajouter
          </button>
        </form>
      </section>

      {/* ——— Photos ——— */}
      <section id="photos" aria-labelledby="photos-titre" className="mt-8 scroll-mt-32 border-2 border-brun p-4 md:p-6">
        <h2 id="photos-titre" className="display text-2xl">
          Photos
        </h2>
        <p className="mt-1 text-sm text-brun-soft">La première photo sert de vignette dans le catalogue. Ordre identique sur la fiche publique.</p>
        {p.images.length === 0 && <p className="mt-4 border-2 border-dashed border-brun/40 p-4 text-center text-brun-soft">Aucune photo.</p>}
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {p.images.map((img, i) => (
            <li key={img.id} id={`photo-${img.id}`} className="scroll-mt-32 border border-brun/40 bg-creme-deep">
              <div className="relative aspect-[4/5] bg-creme">
                <Image src={img.src} alt="" fill sizes="(min-width: 80rem) 25vw, (min-width: 40rem) 45vw, 90vw" className="object-contain" />
                <span className="eyebrow absolute left-2 top-2 bg-creme px-2 py-1 text-[0.7rem]">
                  {i + 1}
                  {i === 0 && " · vignette"}
                </span>
              </div>
              <div className="space-y-3 p-3">
                <form action={updatePhoto} className="space-y-2">
                  <input type="hidden" name="photo" value={img.id} />
                  <div>
                    <label htmlFor={`alt-${img.id}`} className={labelClass}>
                      Texte alternatif
                    </label>
                    <textarea id={`alt-${img.id}`} name="alt" rows={2} defaultValue={img.alt} maxLength={300} className={`${inputClass} py-2 text-sm`} />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label htmlFor={`type-${img.id}`} className={labelClass}>
                        Type
                      </label>
                      <select id={`type-${img.id}`} name="type" defaultValue={img.kind} className={inputClass}>
                        {Object.entries(kindLabels).map(([k, l]) => (
                          <option key={k} value={k}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary min-h-11 px-3">
                      OK
                    </button>
                  </div>
                </form>
                <div className="flex gap-1">
                  {(["haut", "bas"] as const).map((sens) => (
                    <form key={sens} action={movePhoto}>
                      <input type="hidden" name="photo" value={img.id} />
                      <input type="hidden" name="sens" value={sens} />
                      <button
                        type="submit"
                        disabled={sens === "haut" ? i === 0 : i === p.images.length - 1}
                        className="btn btn-ghost min-h-11 min-w-11 px-2 disabled:opacity-30"
                        aria-label={`Déplacer la photo ${i + 1} ${sens === "haut" ? "avant" : "après"}`}
                      >
                        {sens === "haut" ? "←" : "→"}
                      </button>
                    </form>
                  ))}
                  <form action={deletePhoto} className="ml-auto">
                    <input type="hidden" name="photo" value={img.id} />
                    <button type="submit" className="btn btn-ghost min-h-11 px-3 text-[0.75rem]" aria-label={`Supprimer la photo ${i + 1}`}>
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <form action={uploadPhotos} className="mt-6 grid gap-3 border-t-2 border-brun pt-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <input type="hidden" name="id" value={p.id} />
          <div>
            <label htmlFor="photos-fichiers" className={labelClass}>
              Ajouter des photos
            </label>
            <input
              id="photos-fichiers"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              required
              className="block w-full text-sm file:mr-3 file:min-h-11 file:border-2 file:border-brun file:bg-creme file:px-3 file:font-semibold"
            />
          </div>
          <div>
            <label htmlFor="photos-alt" className={labelClass}>
              Texte alternatif
            </label>
            <input id="photos-alt" name="alt" placeholder={p.name} maxLength={300} className={inputClass} />
          </div>
          <button type="submit" className="btn btn-primary min-h-11">
            Envoyer
          </button>
          <p className="text-sm text-brun-soft md:col-span-3">
            JPEG, PNG, WebP ou AVIF, 20 Mo maximum par photo. Elles sont redimensionnées (1 800 px) et converties en WebP.
          </p>
        </form>
      </section>
    </>
  );
}
