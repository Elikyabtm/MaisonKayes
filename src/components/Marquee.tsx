import { Spark } from "./Shapes";

const ITEMS = ["Afro Fusion", "Upcycling", "Vêtements & accessoires", "Maison Kayes"];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center">
          <span className="display px-6 text-2xl md:text-3xl">{item}</span>
          <Spark className="h-4 w-4 text-brun" />
        </li>
      ))}
    </ul>
  );
}

/** Frise texte : défilement lent, version fixe si le mouvement est réduit. */
export function Marquee({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Maison Kayes en quelques mots" className={`overflow-hidden border-y-2 border-brun bg-safran py-3 text-brun ${className}`}>
      <div className="hidden w-max motion-safe:flex motion-safe:animate-marquee">
        <Row />
        <Row hidden />
        <Row hidden />
        <Row hidden />
      </div>
      <div className="flex justify-center motion-safe:hidden">
        <ul className="flex flex-wrap items-center justify-center gap-y-1">
          {ITEMS.map((item) => (
            <li key={item} className="flex items-center">
              <span className="display px-4 text-xl md:text-2xl">{item}</span>
              <Spark className="h-3 w-3" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
