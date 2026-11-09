import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { CustomerLoginForm } from "@/components/account/forms";
import { getCurrentCustomer } from "@/lib/customer/session";

export const metadata = { title: "Connexion", robots: { index: false } };

const notices: Record<string, string> = {
  deconnecte: "Vous êtes déconnecté·e.",
  supprime: "Votre compte a été supprimé.",
};

export default async function CustomerLoginPage({ searchParams }: PageProps<"/compte/connexion">) {
  const sp = await searchParams;
  const raw = typeof sp.suite === "string" ? sp.suite : "/compte";
  const next = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/admin") ? raw : "/compte";
  if (await getCurrentCustomer()) redirect(next);
  const notice = typeof sp.ok === "string" ? notices[sp.ok] : undefined;
  return (
    <AuthShell
      eyebrow="Mon compte"
      title="Connexion"
      intro={<p>Accédez à vos commandes, votre adresse et vos préférences.</p>}
      aside={
        <p>
          Pas encore de compte ?{" "}
          <Link href="/compte/inscription" className="link-arrow">
            Créer un compte <span aria-hidden="true">→</span>
          </Link>
        </p>
      }
    >
      {notice && (
        <p role="status" className="mb-5 border-2 border-brun bg-safran/30 px-4 py-3 font-semibold">
          {notice}
        </p>
      )}
      <CustomerLoginForm next={next} />
    </AuthShell>
  );
}
