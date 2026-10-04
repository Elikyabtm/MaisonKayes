/**
 * Gabarit des pages légales. Tant que les informations de l’entreprise
 * ne sont pas fournies, la page est explicitement signalée comme incomplète.
 */
export function LegalDraft({
  title,
  sections,
}: {
  title: string;
  sections: { title: string; items: string[]; final?: boolean }[];
}) {
  return (
    <div className="container-x pb-24 pt-14 md:pt-20">
      <p className="eyebrow text-ocre-ink">Informations légales</p>
      <h1 className="display mt-4 text-[clamp(3rem,9vw,7rem)]">{title}</h1>
      <p role="note" className="mt-8 max-w-2xl border-2 border-brun bg-safran/30 p-5 font-semibold">
        Page en cours de rédaction : les informations ci-dessous restent à compléter avant publication.
      </p>
      <div className="prose-mk mt-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <ul>
              {s.items.map((item) => (
                <li key={item}>
                  {s.final ? item : <><span className="sr-only">À compléter : </span>{item}</>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
