/**
 * Frises géométriques originales Maison Kayes, en motif SVG répété.
 * À utiliser avec parcimonie, comme ponctuation entre deux sections.
 */
type Variant = "triangles" | "diamonds" | "steps";

const tiles: Record<Variant, (a: string, b: string) => { svg: string; w: number; h: number }> = {
  triangles: (a, b) => ({
    w: 48,
    h: 24,
    svg: `<path d='M0 24 12 0 24 24Z' fill='${a}'/><path d='M24 24 36 8 48 24Z' fill='${b}'/>`,
  }),
  diamonds: (a, b) => ({
    w: 40,
    h: 24,
    svg: `<rect y='11' width='40' height='2' fill='${a}'/><path d='M20 2 30 12 20 22 10 12Z' fill='${a}'/><path d='M20 8 24 12 20 16 16 12Z' fill='${b}'/>`,
  }),
  steps: (a, b) => ({
    w: 64,
    h: 24,
    svg: `<path d='M0 24V16H8V8H16V0H24V24Z' fill='${a}'/><path d='M32 24V16H40V8H48V16H56V24Z' fill='${b}'/>`,
  }),
};

const colors = {
  brun: "#35100C",
  orange: "#F45129",
  safran: "#F6AA16",
  creme: "#F6EFE3",
  ocre: "#B77A19",
  denim: "#2C4570",
} as const;

type ColorName = keyof typeof colors;

export function Frieze({
  variant = "triangles",
  fg = "brun",
  accent = "orange",
  bg,
  className = "",
  height = 24,
}: {
  variant?: Variant;
  fg?: ColorName;
  accent?: ColorName;
  bg?: ColorName;
  className?: string;
  height?: number;
}) {
  const t = tiles[variant](colors[fg], colors[accent]);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${t.w}' height='${t.h}' viewBox='0 0 ${t.w} ${t.h}'>${t.svg}</svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        height,
        backgroundColor: bg ? colors[bg] : undefined,
        backgroundImage: url,
        backgroundRepeat: "repeat-x",
        backgroundSize: `${(t.w * height) / t.h}px ${height}px`,
        backgroundPosition: "left center",
      }}
    />
  );
}
