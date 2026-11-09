import type { ReactNode } from "react";

/** Mise en page des écrans d’authentification client (inscription, connexion…). */
export function AuthShell({ eyebrow, title, intro, children, aside }: { eyebrow: string; title: string; intro?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="container-x grid gap-10 pb-24 pt-14 md:grid-cols-12 md:pt-20 lg:pt-24">
      <div className="md:col-span-5">
        <p className="eyebrow text-ocre-ink">{eyebrow}</p>
        <h1 className="display mt-4 text-[clamp(2.8rem,8vw,5.5rem)]">{title}</h1>
        {intro && <div className="mt-6 max-w-md text-lg">{intro}</div>}
        {aside && <div className="mt-8">{aside}</div>}
      </div>
      <div className="md:col-span-6 md:col-start-7">
        <div className="border-2 border-brun bg-creme p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
