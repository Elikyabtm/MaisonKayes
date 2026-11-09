import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { SignupForm } from "@/components/account/forms";
import { getCurrentCustomer } from "@/lib/customer/session";

export const metadata = { title: "Créer un compte", robots: { index: false } };

export default async function SignupPage() {
  if (await getCurrentCustomer()) redirect("/compte");
  return (
    <AuthShell
      eyebrow="Mon compte"
      title="Créer un compte"
      intro={
        <ul className="space-y-2">
          <li>Retrouvez vos commandes et leur suivi.</li>
          <li>Enregistrez votre adresse pour commander plus vite.</li>
          <li>Le compte reste facultatif : vous pouvez aussi commander sans.</li>
        </ul>
      }
      aside={
        <p>
          Déjà un compte ?{" "}
          <Link href="/compte/connexion" className="link-arrow">
            Se connecter <span aria-hidden="true">→</span>
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
