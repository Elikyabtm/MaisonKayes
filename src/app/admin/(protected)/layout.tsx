import { and, count, eq } from "drizzle-orm";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/Logo";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { logout } from "../connexion/actions";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Affichage du nom et du compteur ; chaque page et action revérifie la session (requireAdmin).
  const admin = await requireAdmin();
  const db = await getDb();
  const [{ n: toPrepare }] = await db
    .select({ n: count() })
    .from(schema.orders)
    .where(and(eq(schema.orders.fulfillmentStatus, "a_preparer"), eq(schema.orders.paymentStatus, "paye")));

  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-brun bg-creme">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 md:px-6">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Administration — vue d’ensemble">
            <Logo className="w-11" sizes="44px" />
            <span className="eyebrow hidden text-[0.72rem] sm:inline">Administration</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-brun-soft md:inline">{admin.name}</span>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-10 px-3 py-1.5 text-[0.75rem]">
              Voir le site <span aria-hidden="true">↗</span>
              <span className="sr-only">(nouvel onglet)</span>
            </a>
            <form action={logout}>
              <button type="submit" className="btn btn-primary min-h-10 px-3 py-1.5 text-[0.75rem]">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
        <AdminNav toPrepare={toPrepare} />
      </header>
      <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-6 md:px-6 md:pt-8">
        {children}
      </main>
    </>
  );
}
