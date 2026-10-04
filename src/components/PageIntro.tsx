import type { ReactNode } from "react";

/** En-tête de page : surtitre + titre XXL + chapeau. */
export function PageIntro({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`container-x pb-12 pt-14 md:pb-16 md:pt-20 ${className}`}>
      <p className="eyebrow text-ocre-ink">{eyebrow}</p>
      <h1 className="display mt-4 max-w-[14ch] text-[clamp(3.2rem,11vw,9.5rem)]">{title}</h1>
      {children && <div className="mt-8 max-w-2xl text-lg md:text-xl">{children}</div>}
    </div>
  );
}
