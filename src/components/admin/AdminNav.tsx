"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items: { href: string; label: string; short?: string }[] = [
  { href: "/admin", label: "Vue d’ensemble", short: "Accueil" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/stocks", label: "Stocks" },
  { href: "/admin/catalogue", label: "Catalogue" },
];

export function AdminNav({ toPrepare }: { toPrepare: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="mx-auto max-w-7xl overflow-x-auto px-4 md:px-6">
      <ul className="flex min-w-max gap-1">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex min-h-11 items-center gap-1.5 px-2 text-[0.78rem] font-semibold sm:gap-2 sm:px-3 sm:text-[0.85rem] uppercase tracking-wide [font-stretch:85%] hover:text-orange ${
                  active ? "after:absolute after:inset-x-2 after:bottom-0 sm:after:inset-x-3 after:h-[3px] after:bg-orange" : ""
                }`}
              >
                {item.short ? (
                  <>
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
                {item.href === "/admin/commandes" && toPrepare > 0 && (
                  <span className="bg-orange px-1.5 text-[0.7rem] text-brun" aria-label={`${toPrepare} à préparer`}>
                    {toPrepare}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
