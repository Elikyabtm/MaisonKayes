/**
 * Formes géométriques Maison Kayes (losange, demi-disque, triangle, anneaux).
 * Purement décoratives : toujours `aria-hidden`.
 */
type ShapeProps = { className?: string };

export function Diamond({ className }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path d="M50 0 100 50 50 100 0 50Z" fill="currentColor" />
    </svg>
  );
}

export function HalfDisc({ className }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 50" className={className} aria-hidden="true" focusable="false">
      <path d="M0 50a50 50 0 0 1 100 0Z" fill="currentColor" />
    </svg>
  );
}

export function Triangle({ className }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 87" className={className} aria-hidden="true" focusable="false">
      <path d="M50 0 100 87H0Z" fill="currentColor" />
    </svg>
  );
}

export function Rings({ className }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="50" cy="50" r="48" />
        <circle cx="50" cy="50" r="34" />
        <circle cx="50" cy="50" r="20" />
      </g>
      <circle cx="50" cy="50" r="7" fill="currentColor" />
    </svg>
  );
}

/** Étoile à quatre branches, utilisée comme séparateur ✦ */
export function Spark({ className }: ShapeProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" focusable="false">
      <path d="M10 0c.9 5.4 4.6 9.1 10 10-5.4.9-9.1 4.6-10 10-.9-5.4-4.6-9.1-10-10C5.4 9.1 9.1 5.4 10 0Z" fill="currentColor" />
    </svg>
  );
}
