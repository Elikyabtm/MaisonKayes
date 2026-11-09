import type { FulfillmentStatus, PaymentStatus } from "@/db/schema";
import { flashMessages, fulfillmentLabels, paymentLabels, stockLevelLabels, type StockLevel } from "@/lib/admin/labels";

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b-2 border-brun pb-4 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="display text-[clamp(2.2rem,6vw,3.6rem)]">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Message de retour d’une action (?ok=code ou ?erreur=code). */
export function Flash({ params }: { params: Record<string, string | string[] | undefined> }) {
  const ok = typeof params.ok === "string" ? flashMessages[params.ok] : undefined;
  const err = typeof params.erreur === "string" ? flashMessages[params.erreur] : undefined;
  if (!ok && !err) return null;
  return (
    <p
      role={err ? "alert" : "status"}
      className={`mb-6 border-2 border-brun px-4 py-3 font-semibold ${err ? "bg-orange/25" : "bg-safran/30"}`}
    >
      {err ?? ok}
    </p>
  );
}

const tone = {
  neutral: "border-brun/40 bg-creme",
  warn: "border-brun bg-safran",
  alert: "border-brun bg-orange",
  ok: "border-brun bg-creme-deep",
  dark: "border-brun bg-brun text-creme",
  muted: "border-brun/30 bg-creme text-brun-soft",
};

export function Badge({ children, kind = "neutral" }: { children: React.ReactNode; kind?: keyof typeof tone }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap border px-1.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide [font-stretch:85%] ${tone[kind]}`}>
      {children}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const kind = status === "paye" ? "ok" : status === "en_attente" ? "warn" : status === "echoue" ? "alert" : "muted";
  return <Badge kind={kind}>{paymentLabels[status]}</Badge>;
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const kind = status === "a_preparer" ? "alert" : status === "expediee" ? "warn" : status === "remise" ? "dark" : "muted";
  return <Badge kind={kind}>{fulfillmentLabels[status]}</Badge>;
}

export function StockBadge({ level }: { level: StockLevel }) {
  const kind = level === "rupture" ? "alert" : level === "bas" ? "warn" : level === "inconnu" ? "muted" : "ok";
  return <Badge kind={kind}>{stockLevelLabels[level]}</Badge>;
}

export const inputClass = "block min-h-11 w-full border-2 border-brun/60 bg-white px-3 text-base focus:border-brun";
export const labelClass = "eyebrow mb-1.5 block text-[0.72rem]";

export const dateTime = (d: Date) =>
  new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" }).format(d);
