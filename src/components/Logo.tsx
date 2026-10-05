import Image from "next/image";
import { site } from "@/data/site";
import { Diamond } from "./Shapes";

/** Dimensions du fichier logo (format presque carré). */
export const LOGO_SIZE = { width: 800, height: 790 };

/**
 * Logo officiel Maison Kayes (`site.logoSrc`), affiché sans déformation ni recadrage.
 * Le fichier a un fond transparent et un texte noir : le poser sur un fond clair.
 * Sans fichier, un logotype typographique sert de remplacement.
 */
export function Logo({
  className = "",
  sizes = "8rem",
  priority = false,
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (site.logoSrc) {
    return (
      <Image
        src={site.logoSrc}
        alt={`${site.name} — Créations Afro Fusion`}
        width={LOGO_SIZE.width}
        height={LOGO_SIZE.height}
        sizes={sizes}
        priority={priority}
        quality={85}
        className={`h-auto ${className}`}
      />
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 text-brun ${className}`}>
      <Diamond className="h-5 w-5 text-orange" />
      <span className="flex flex-col leading-none">
        <span className="eyebrow text-[0.62rem] tracking-[0.42em]">Maison</span>
        <span className="display text-[1.65rem] tracking-[0.04em]">Kayes</span>
      </span>
      <span className="sr-only">{site.name}</span>
    </span>
  );
}
