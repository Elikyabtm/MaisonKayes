"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mainNav } from "@/data/site";
import { EtsyShopButton } from "./EtsyLinks";
import { Logo } from "./Logo";
import { Diamond } from "./Shapes";

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Verrouillage du défilement, Échap, piège de focus
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = [toggleRef.current, ...panel.querySelectorAll<HTMLElement>("a, button")].filter(
        Boolean,
      ) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Logo en badge débordant en haut de page, compact après défilement
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const compact = scrolled || open;

  // Ferme le menu si l’écran passe en desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-brun bg-creme">
      <a
        href="#contenu"
        className="sr-only z-50 bg-brun px-4 py-2 text-creme focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Aller au contenu
      </a>
      <div className="container-x flex h-[4.25rem] items-center justify-between gap-6">
        {/* Emplacement réservé : le badge du logo est positionné par-dessus */}
        <div className="relative h-full w-[5.75rem] shrink-0 sm:w-[6.5rem] lg:w-[8.25rem]">
          <Link
            href="/"
            aria-label="Maison Kayes — accueil"
            onClick={() => setOpen(false)}
            className={`absolute left-0 top-0 block bg-creme transition-[padding] duration-300 ${
              compact ? "p-1.5" : "border-x-2 border-b-2 border-brun p-2 lg:p-2.5"
            }`}
          >
            <Logo
              priority
              sizes="(min-width: 64rem) 120px, 96px"
              className={`transition-[width] duration-300 ${
                compact ? "w-[3.5rem]" : "w-[5.25rem] sm:w-[6rem] lg:w-[7.5rem]"
              }`}
            />
          </Link>
        </div>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-3">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex min-h-11 items-center px-2.5 text-[0.92rem] font-semibold tracking-wide [font-stretch:85%] uppercase transition-colors hover:text-orange ${
                      active ? "after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-[3px] after:bg-orange" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <EtsyShopButton className="btn btn-orange hidden min-h-11 px-4 py-2 text-[0.85rem] sm:inline-flex" />
          <button
            ref={toggleRef}
            type="button"
            className="btn btn-ghost min-h-11 px-3.5 py-2 text-[0.85rem] lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => (open ? close(false) : setOpen(true))}
          >
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
            {open ? "Fermer" : "Menu"}
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!open}
        className="on-dark fixed inset-x-0 bottom-0 top-[calc(4.25rem+2px)] z-40 overflow-y-auto bg-brun text-creme lg:hidden"
      >
        <nav aria-label="Navigation mobile" className="container-x flex min-h-full flex-col py-8">
          <ul className="border-t border-creme/25">
            {mainNav.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-creme/25">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`display flex items-center justify-between py-4 text-[2.6rem] xs:text-5xl ${active ? "text-safran" : "hover:text-orange"}`}
                  >
                    <span>
                      <span className="eyebrow mr-4 align-middle text-[0.7rem] text-creme/60">0{i + 1}</span>
                      {item.label}
                    </span>
                    {active && <Diamond className="h-4 w-4 text-safran" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8">
            <EtsyShopButton className="btn btn-orange w-full text-base" onClick={() => setOpen(false)} />
          </div>
        </nav>
      </div>
    </header>
  );
}
