import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge, Flash, PageTitle, StockBadge } from "@/components/admin/ui";
import { categories, isCategory } from "@/data/categories";
import { moveProduct } from "@/lib/admin/actions/catalog";
import { listProductsAdmin } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Catalogue" };

export default async function CataloguePage({ searchParams }: PageProps<"/admin/catalogue">) {
  await requireAdmin();
  const sp = await searchParams;
  const list = await listProductsAdmin();

  return (
    <>
      <PageTitle title="Catalogue">
        <Link href="/admin/catalogue/nouveau" className="btn btn-primary min-h-11">
          + Nouvelle fiche
        </Link>
      </PageTitle>
      <Flash params={sp} />
      <p className="mb-4 text-sm text-brun-soft">
        L’ordre ci-dessous est celui du catalogue public ; les cinq premières fiches visibles forment la sélection de l’accueil.
      </p>
      <ol>
        {list.map((p, i) => {
          const stockTotal = p.variants.reduce((n, v) => n + (v.stock ?? 0), 0);
          const unknown = p.variants.some((v) => v.stock === null);
          return (
            <li key={p.id} className="flex items-center gap-3 border-b border-brun/20 py-3">
              <span className="relative block h-16 w-14 shrink-0 overflow-hidden bg-creme-deep">
                {p.thumb ? <Image src={p.thumb} alt="" fill sizes="56px" className="object-cover" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <Link href={`/admin/catalogue/${p.id}`} className="font-bold hover:underline">
                  {p.name}
                </Link>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-brun-soft">{isCategory(p.category) ? categories[p.category].label : p.category}</span>
                  <span aria-hidden="true">·</span>
                  {p.priceCents ? <span>{formatMoney(p.priceCents, p.currency)}</span> : <Badge kind="muted">Prix à renseigner</Badge>}
                  {p.visible ? <Badge kind="ok">Visible</Badge> : <Badge kind="dark">Masquée</Badge>}
                  {unknown ? (
                    <StockBadge level="inconnu" />
                  ) : (
                    <span className="text-brun-soft">
                      {stockTotal} en stock{p.variants.length > 1 ? ` (${p.variants.length} variantes)` : ""}
                    </span>
                  )}
                </span>
              </span>
              <span className="flex shrink-0 gap-1">
                {(["haut", "bas"] as const).map((sens) => (
                  <form key={sens} action={moveProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="sens" value={sens} />
                    <button
                      type="submit"
                      disabled={sens === "haut" ? i === 0 : i === list.length - 1}
                      className="btn btn-ghost min-h-11 min-w-11 px-2 py-1 disabled:opacity-30"
                      aria-label={`Déplacer « ${p.name} » vers le ${sens}`}
                    >
                      {sens === "haut" ? "↑" : "↓"}
                    </button>
                  </form>
                ))}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
