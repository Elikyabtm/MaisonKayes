import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { dateTime, Flash, inputClass, labelClass, PageTitle, StockBadge } from "@/components/admin/ui";
import { categories, isCategory } from "@/data/categories";
import { stockReasons } from "@/db/schema";
import { moveStockAction, setThresholdAction } from "@/lib/admin/actions/stock";
import type { StockLevel } from "@/lib/admin/labels";
import { listStock, recentMovements } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Stocks" };

const FILTERS: { value: "" | StockLevel; label: string }[] = [
  { value: "", label: "Tout" },
  { value: "inconnu", label: "À renseigner" },
  { value: "bas", label: "Stock bas" },
  { value: "rupture", label: "Ruptures" },
];
const MANUAL = ["reception", "correction", "retour", "perte", "autre"] as const;

export default async function StocksPage({ searchParams }: PageProps<"/admin/stocks">) {
  await requireAdmin();
  const sp = await searchParams;
  const filtre = typeof sp.filtre === "string" ? sp.filtre : "";
  const all = await listStock();
  const products = all
    .map((p) => ({ ...p, variants: filtre ? p.variants.filter((v) => v.level === filtre) : p.variants }))
    .filter((p) => p.variants.length > 0);
  const recent = await recentMovements(products.flatMap((p) => p.variants.map((v) => v.id)));
  const self = `/admin/stocks${filtre ? `?filtre=${filtre}` : ""}`;

  return (
    <>
      <PageTitle title="Stocks">
        <Link href="/admin/stocks/historique" className="btn btn-ghost min-h-11">
          Historique des mouvements
        </Link>
      </PageTitle>
      <Flash params={sp} />

      <nav aria-label="Filtrer les stocks" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/stocks?filtre=${f.value}` : "/admin/stocks"}
            aria-current={filtre === f.value ? "page" : undefined}
            className={`btn min-h-11 px-4 py-2 text-[0.8rem] ${filtre === f.value ? "btn-primary" : "btn-ghost"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {products.length === 0 && <p className="border-2 border-dashed border-brun/40 p-6 text-center text-brun-soft">Aucune variante dans ce filtre.</p>}

      <ul className="space-y-6">
        {products.map((p) => (
          <li key={p.id} className="border-2 border-brun">
            <div className="flex items-center gap-3 border-b-2 border-brun bg-creme-deep p-3">
              {p.thumb && (
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden bg-creme">
                  <Image src={p.thumb} alt="" fill sizes="48px" className="object-cover" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <Link href={`/admin/catalogue/${p.id}`} className="font-bold hover:underline">
                  {p.name}
                </Link>
                <span className="block text-sm text-brun-soft">
                  {isCategory(p.category) ? categories[p.category].label : p.category}
                  {!p.visible && " · fiche masquée"}
                </span>
              </span>
            </div>
            <ul>
              {p.variants.map((v) => {
                const moves = recent.get(v.id) ?? [];
                return (
                  <li key={v.id} id={`variante-${v.id}`} className="scroll-mt-32 border-b border-brun/20 p-3 last:border-0 md:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-semibold">{v.name === "Unique" ? "Pièce sans variante" : v.name}</h2>
                      <span className="flex items-center gap-3">
                        <span className="display text-3xl" aria-label="Quantité en stock">
                          {v.stock ?? "—"}
                        </span>
                        <StockBadge level={v.level} />
                      </span>
                    </div>

                    <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto]">
                      <form action={moveStockAction} className="grid grid-cols-2 gap-2 sm:grid-cols-[auto_6rem_1fr_1fr_auto] sm:items-end">
                        <input type="hidden" name="variante" value={v.id} />
                        <input type="hidden" name="retour" value={`${self}#variante-${v.id}`} />
                        <div>
                          <label htmlFor={`op-${v.id}`} className={labelClass}>
                            Opération
                          </label>
                          <select id={`op-${v.id}`} name="operation" defaultValue={v.stock === null ? "fixer" : "ajouter"} className={inputClass}>
                            <option value="ajouter">Ajouter</option>
                            <option value="retirer">Retirer</option>
                            <option value="fixer">Fixer à</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`qte-${v.id}`} className={labelClass}>
                            Quantité
                          </label>
                          <input id={`qte-${v.id}`} name="quantite" type="number" min={0} step={1} required inputMode="numeric" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor={`motif-${v.id}`} className={labelClass}>
                            Motif
                          </label>
                          <select id={`motif-${v.id}`} name="motif" defaultValue={v.stock === null ? "correction" : "reception"} className={inputClass}>
                            {MANUAL.map((r) => (
                              <option key={r} value={r}>
                                {stockReasons[r]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`note-${v.id}`} className={labelClass}>
                            Note
                          </label>
                          <input id={`note-${v.id}`} name="note" placeholder="Facultatif" className={inputClass} />
                        </div>
                        <button type="submit" className="btn btn-primary col-span-2 min-h-11 sm:col-span-1">
                          Valider
                        </button>
                      </form>

                      <form action={setThresholdAction} className="flex items-end gap-2">
                        <input type="hidden" name="variante" value={v.id} />
                        <input type="hidden" name="retour" value={`${self}#variante-${v.id}`} />
                        <div className="w-28">
                          <label htmlFor={`seuil-${v.id}`} className={labelClass}>
                            Seuil d’alerte
                          </label>
                          <input id={`seuil-${v.id}`} name="seuil" type="number" min={0} step={1} defaultValue={v.lowStockThreshold} inputMode="numeric" className={inputClass} />
                        </div>
                        <button type="submit" className="btn btn-ghost min-h-11">
                          OK
                        </button>
                      </form>
                    </div>

                    {moves.length > 0 && (
                      <details className="mt-3 text-sm">
                        <summary className="cursor-pointer font-semibold">Derniers mouvements</summary>
                        <ul className="mt-2">
                          {moves.map((m) => (
                            <li key={m.id} className="flex flex-wrap justify-between gap-2 border-t border-brun/15 py-1.5">
                              <span>
                                {dateTime(m.createdAt)} · {stockReasons[m.reason]}
                                {m.note && <span className="text-brun-soft"> · {m.note}</span>}
                                {m.adminName && <span className="text-brun-soft"> · {m.adminName}</span>}
                              </span>
                              <span className="font-semibold">
                                {m.delta > 0 ? `+${m.delta}` : m.delta} → {m.stockAfter}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Link href={`/admin/stocks/historique?variante=${v.id}`} className="mt-1 inline-block underline">
                          Tout l’historique
                        </Link>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
