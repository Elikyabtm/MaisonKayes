import Link from "next/link";
import { Diamond } from "@/components/Shapes";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <section className="container-x flex flex-col items-start py-24 md:py-36">
      <p className="eyebrow text-ocre-ink">Erreur 404</p>
      <h1 className="display mt-4 text-[clamp(3.4rem,12vw,10rem)]">
        Cette page
        <br />
        <span className="inline-flex items-center gap-4">
          s’est perdue
          <Diamond className="h-[0.5em] w-[0.5em] text-orange" />
        </span>
      </h1>
      <p className="mt-6 max-w-lg text-lg">
        Rien ne se perd pourtant : la page que vous cherchez a peut-être changé d’adresse.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Retour à l’accueil
        </Link>
        <Link href="/creations" className="btn btn-ghost">
          Voir les créations
        </Link>
      </div>
    </section>
  );
}
