import Image from "next/image";
import { site } from "@/data/site";
import { Diamond } from "./Shapes";

/**
 * Logotype. Si `site.logoSrc` est renseigné, le fichier fourni est utilisé ;
 * sinon, un logotype typographique sert de remplacement.
 */
export function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  if (site.logoSrc) {
    return <Image src={site.logoSrc} alt={site.name} width={160} height={48} className={className} priority />;
  }
  const color = tone === "light" ? "text-creme" : "text-brun";
  return (
    <span className={`inline-flex items-center gap-2 ${color} ${className}`}>
      <Diamond className="h-5 w-5 text-orange" />
      <span className="flex flex-col leading-none">
        <span className="eyebrow text-[0.62rem] tracking-[0.42em]">Maison</span>
        <span className="display text-[1.65rem] tracking-[0.04em]">Kayes</span>
      </span>
      <span className="sr-only">{site.name}</span>
    </span>
  );
}
