import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NotFoundContent } from "@/components/NotFoundContent";

export const metadata = { title: "Page introuvable" };

/** URL inconnues : 404 avec l’en-tête et le pied de page du site. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="flex-1 focus:outline-none">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
