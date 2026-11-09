import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentAdmin } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion — Administration", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo className="w-28" sizes="7rem" priority />
        </div>
        <h1 className="display mt-8 text-center text-4xl">Administration</h1>
        <p className="mt-2 text-center text-brun-soft">Accès réservé aux administrateurs de Maison Kayes.</p>
        <div className="mt-8 border-2 border-brun bg-creme p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
