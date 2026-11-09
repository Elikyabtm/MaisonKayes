import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

/** Mise en page du site public (le dashboard /admin a la sienne). */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
