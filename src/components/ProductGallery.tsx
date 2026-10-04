"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/data/products";

const kindLabel: Record<ProductImage["kind"], string> = {
  produit: "Photo produit",
  portee: "Portée",
  detail: "Détail",
  scene: "Mise en scène",
};

/** Agrandissement maximal d’une image, pour ne pas étirer les fichiers basse définition. */
const MAX_UPSCALE = 2;

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = images[index];
  const count = images.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [go]);

  const frameMax = Math.min(current.width * MAX_UPSCALE, 900);

  return (
    <div>
      <div className="relative bg-creme-deep">
        <button
          type="button"
          onClick={open}
          className="group relative mx-auto block aspect-[4/5] w-full cursor-zoom-in"
          style={{ maxWidth: frameMax }}
          aria-label={`Agrandir l’image : ${current.alt}`}
        >
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            priority
            quality={85}
            sizes="(min-width: 64rem) 50vw, 100vw"
            className="object-contain"
            style={{ objectPosition: "50% 50%" }}
          />
          <span className="eyebrow absolute bottom-3 right-3 bg-creme px-2 py-1 text-[0.7rem] opacity-90 group-hover:bg-safran">
            Agrandir +
          </span>
        </button>
        <p className="eyebrow absolute left-3 top-3 bg-creme px-2 py-1 text-[0.7rem]" aria-live="polite">
          {kindLabel[current.kind]} · {index + 1}/{count}
        </p>
      </div>

      {count > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label={`Images de ${productName}`}>
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Afficher l’image ${i + 1} : ${kindLabel[img.kind]}`}
                className={`relative block aspect-square w-full overflow-hidden border-2 transition-colors ${
                  i === index ? "border-orange" : "border-transparent hover:border-brun"
                }`}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                  style={{ objectPosition: img.position ?? "50% 50%" }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${productName} — agrandissement`}
        className="on-dark m-0 h-dvh max-h-none w-screen max-w-none bg-brun/95 p-0 text-creme backdrop:bg-brun/80"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="eyebrow" aria-live="polite">
              {index + 1}/{count} · {kindLabel[current.kind]}
            </p>
            <button type="button" onClick={close} className="btn btn-ghost min-h-11 px-4 py-2" autoFocus>
              Fermer <span aria-hidden="true">✕</span>
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
            <div
              className="relative mx-auto h-full"
              style={{ maxWidth: `min(100%, ${current.width * MAX_UPSCALE}px)`, maxHeight: current.height * MAX_UPSCALE }}
            >
              <Image src={current.src} alt={current.alt} fill quality={85} sizes="100vw" className="object-contain" />
            </div>
          </div>
          {count > 1 && (
            <div className="flex items-center justify-center gap-3 px-4 py-4">
              <button type="button" onClick={() => go(-1)} className="btn btn-ghost min-h-11 px-4 py-2">
                <span aria-hidden="true">←</span> Précédente
              </button>
              <button type="button" onClick={() => go(1)} className="btn btn-ghost min-h-11 px-4 py-2">
                Suivante <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
