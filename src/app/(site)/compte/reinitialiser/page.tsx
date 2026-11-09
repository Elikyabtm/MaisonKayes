import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { ResetPasswordForm } from "@/components/account/forms";

export const metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/compte/reinitialiser">) {
  const sp = await searchParams;
  const token = typeof sp.jeton === "string" ? sp.jeton : "";
  return (
    <AuthShell eyebrow="Mon compte" title="Nouveau mot de passe" intro={<p>Choisissez un nouveau mot de passe pour votre compte.</p>}>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p>
          Lien incomplet.{" "}
          <Link href="/compte/mot-de-passe-oublie" className="underline">
            Faire une nouvelle demande
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
