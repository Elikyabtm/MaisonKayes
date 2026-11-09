import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { ForgotPasswordForm } from "@/components/account/forms";

export const metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Mon compte"
      title="Mot de passe oublié"
      intro={<p>Indiquez l’adresse de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>}
      aside={
        <Link href="/compte/connexion" className="link-arrow">
          <span aria-hidden="true">←</span> Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
