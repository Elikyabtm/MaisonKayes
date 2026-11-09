import "server-only";
import type { PostalAddress } from "@/db/schema";
import { site } from "@/data/site";
import { formatMoney } from "@/lib/money";

/** Données d’une commande nécessaires aux e-mails. */
export type EmailOrder = {
  id: number;
  reference: string;
  createdAt: Date;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingName: string | null;
  shippingAddress: PostalAddress | null;
  shippingLabel: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: { productName: string; variantName: string | null; quantity: number; unitCents: number; totalCents: number }[];
};

export type RenderedEmail = { subject: string; html: string; text: string };

const C = { creme: "#F6EFE3", deep: "#ECE0CB", brun: "#35100C", soft: "#5A2A20", orange: "#F45129", safran: "#F6AA16" };
const FONT = "Arial, Helvetica, sans-serif";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const country = (code: string | null) => {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["fr"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

const dateFr = (d: Date) => new Intl.DateTimeFormat("fr-BE", { dateStyle: "long", timeZone: "Europe/Brussels" }).format(d);

const firstName = (o: EmailOrder) => (o.customerName ?? o.shippingName ?? "").trim().split(/\s+/)[0] || "";

function addressLines(o: EmailOrder): string[] {
  const a = o.shippingAddress;
  if (!a) return [];
  return [o.shippingName, a.line1, a.line2, [a.postalCode, a.city].filter(Boolean).join(" "), a.state, country(a.country)].filter(
    (l): l is string => Boolean(l && l.trim()),
  );
}

const itemLabel = (i: EmailOrder["items"][number]) => `${i.productName}${i.variantName ? ` — ${i.variantName}` : ""}`;

/* ——— Mise en page commune ——— */

function layout(opts: { preheader: string; title: string; body: string; footerNote?: string }) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${C.creme};color:${C.brun};font-family:${FONT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.creme};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:2px solid ${C.brun};">
<tr><td style="background:${C.brun};padding:18px 24px;">
  <div style="font-family:${FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.safran};">Maison</div>
  <div style="font-family:Impact,'Arial Narrow',${FONT};font-size:28px;letter-spacing:2px;text-transform:uppercase;color:${C.creme};line-height:1;">Kayes</div>
</td></tr>
<tr><td style="height:6px;background:${C.orange};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:28px 24px 8px;">
  <h1 style="margin:0 0 16px;font-family:Impact,'Arial Narrow',${FONT};font-size:30px;line-height:1.1;text-transform:uppercase;font-weight:normal;color:${C.brun};">${esc(opts.title)}</h1>
  ${opts.body}
</td></tr>
<tr><td style="padding:20px 24px 28px;border-top:1px solid ${C.deep};font-size:13px;line-height:1.5;color:${C.soft};">
  ${opts.footerNote ? `<p style="margin:0 0 10px;">${opts.footerNote}</p>` : ""}
  <p style="margin:0;">Une question ? Répondez simplement à cet e-mail${site.contact.email ? ` ou écrivez à <a href="mailto:${esc(site.contact.email)}" style="color:${C.brun};">${esc(site.contact.email)}</a>` : ""}.</p>
  <p style="margin:10px 0 0;">${esc(site.name)} — Afro Fusion · <a href="${esc(site.url)}" style="color:${C.brun};">${esc(site.url.replace(/^https?:\/\//, ""))}</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;">${html}</p>`;
const label = (t: string) =>
  `<div style="margin:22px 0 8px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${C.soft};border-bottom:2px solid ${C.brun};padding-bottom:6px;">${esc(t)}</div>`;

function itemsTable(o: EmailOrder, withTotals: boolean) {
  const money = (c: number) => esc(formatMoney(c, o.currency));
  const rows = o.items
    .map(
      (i) => `<tr>
  <td style="padding:8px 0;border-bottom:1px solid ${C.deep};font-size:14px;line-height:1.4;">
    <strong>${esc(i.productName)}</strong>${i.variantName ? `<br><span style="color:${C.soft};">Variante : ${esc(i.variantName)}</span>` : ""}
    <br><span style="color:${C.soft};">Quantité : ${i.quantity}</span>
  </td>
  <td align="right" style="padding:8px 0;border-bottom:1px solid ${C.deep};font-size:14px;white-space:nowrap;vertical-align:top;">${money(i.totalCents)}</td>
</tr>`,
    )
    .join("");
  const totals = withTotals
    ? `<tr><td style="padding:8px 0 2px;font-size:14px;">Sous-total</td><td align="right" style="padding:8px 0 2px;font-size:14px;">${money(o.subtotalCents)}</td></tr>
<tr><td style="padding:2px 0;font-size:14px;">Livraison${o.shippingLabel ? ` (${esc(o.shippingLabel)})` : ""}</td><td align="right" style="padding:2px 0;font-size:14px;">${money(o.shippingCents)}</td></tr>
<tr><td style="padding:10px 0 0;font-size:16px;font-weight:bold;border-top:2px solid ${C.brun};">Total payé</td><td align="right" style="padding:10px 0 0;font-size:16px;font-weight:bold;border-top:2px solid ${C.brun};">${money(o.totalCents)}</td></tr>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}${totals}</table>`;
}

function addressBlock(o: EmailOrder) {
  const lines = addressLines(o);
  if (!lines.length) return p(`<span style="color:${C.soft};">Adresse non transmise.</span>`);
  return `<p style="margin:0;font-size:14px;line-height:1.55;">${lines.map(esc).join("<br>")}</p>`;
}

function referenceBox(o: EmailOrder) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 8px;"><tr>
<td style="background:${C.safran};border:2px solid ${C.brun};padding:8px 14px;font-size:14px;">Commande <strong>${esc(o.reference)}</strong> · ${esc(dateFr(o.createdAt))}</td>
</tr></table>`;
}

const textItems = (o: EmailOrder, withTotals = true) =>
  [
    ...o.items.map((i) => `- ${itemLabel(i)} × ${i.quantity} : ${formatMoney(i.totalCents, o.currency)}`),
    ...(withTotals
      ? [
          `Sous-total : ${formatMoney(o.subtotalCents, o.currency)}`,
          `Livraison${o.shippingLabel ? ` (${o.shippingLabel})` : ""} : ${formatMoney(o.shippingCents, o.currency)}`,
          `Total payé : ${formatMoney(o.totalCents, o.currency)}`,
        ]
      : []),
  ].join("\n");

const textFooter = () =>
  `\n\nUne question ? Répondez simplement à cet e-mail${site.contact.email ? ` ou écrivez à ${site.contact.email}` : ""}.\n${site.name} — ${site.url}`;

/* ——— 1. Confirmation au client ——— */

export function confirmationEmail(o: EmailOrder): RenderedEmail {
  const name = firstName(o);
  const subject = `Votre commande ${o.reference} est confirmée — ${site.name}`;
  const html = layout({
    preheader: `Merci pour votre commande ${o.reference}. Nous la préparons avec soin.`,
    title: `Merci${name ? ` ${name}` : ""} !`,
    body: [
      p("Votre paiement est confirmé et votre commande est enregistrée. Nous la préparons avec soin et vous écrirons dès son expédition."),
      referenceBox(o),
      label("Votre commande"),
      itemsTable(o, true),
      label("Livraison"),
      addressBlock(o),
    ].join(""),
    footerNote: "Le reçu de paiement vous est envoyé séparément par notre prestataire de paiement, Stripe.",
  });
  const text = [
    `Merci${name ? ` ${name}` : ""} !`,
    "",
    "Votre paiement est confirmé et votre commande est enregistrée. Nous la préparons avec soin et vous écrirons dès son expédition.",
    "",
    `Commande ${o.reference} — ${dateFr(o.createdAt)}`,
    "",
    textItems(o),
    "",
    "Livraison :",
    ...addressLines(o),
    "",
    "Le reçu de paiement vous est envoyé séparément par notre prestataire de paiement, Stripe.",
  ].join("\n");
  return { subject, html, text: text + textFooter() };
}

/* ——— 2. Notification interne ——— */

export function internalNotificationEmail(o: EmailOrder): RenderedEmail {
  const total = formatMoney(o.totalCents, o.currency);
  const adminUrl = `${site.url}/admin/commandes/${o.id}`;
  const subject = `Nouvelle commande à préparer — ${o.reference} (${total})`;
  const contact = [o.customerName, o.customerEmail, o.customerPhone].filter(Boolean) as string[];
  const html = layout({
    preheader: `${o.reference} · ${o.items.map(itemLabel).join(", ")}`,
    title: "Nouvelle commande à préparer",
    body: [
      referenceBox(o),
      label("Articles"),
      itemsTable(o, true),
      label("Client"),
      `<p style="margin:0;font-size:14px;line-height:1.55;">${contact.map(esc).join("<br>") || "—"}</p>`,
      label("Livraison"),
      addressBlock(o),
      `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td style="background:${C.brun};">
        <a href="${esc(adminUrl)}" style="display:inline-block;padding:12px 20px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${C.creme};text-decoration:none;">Ouvrir dans le dashboard</a>
      </td></tr></table>`,
    ].join(""),
  });
  const text = [
    "Nouvelle commande à préparer",
    "",
    `Commande ${o.reference} — ${dateFr(o.createdAt)}`,
    "",
    textItems(o),
    "",
    "Client :",
    ...contact,
    "",
    "Livraison :",
    ...addressLines(o),
    "",
    `Dashboard : ${adminUrl}`,
  ].join("\n");
  return { subject, html, text };
}

/* ——— 3. Expédition ——— */

export function shippedEmail(o: EmailOrder): RenderedEmail {
  const name = firstName(o);
  const subject = `Votre commande ${o.reference} est en route — ${site.name}`;
  const tracking = [
    o.carrier && `Transporteur : <strong>${esc(o.carrier)}</strong>`,
    o.trackingNumber && `Numéro de suivi : <strong>${esc(o.trackingNumber)}</strong>`,
  ].filter(Boolean);
  const html = layout({
    preheader: `Votre commande ${o.reference} vient d’être expédiée.`,
    title: "Votre commande est en route",
    body: [
      p(`${name ? `Bonjour ${esc(name)}, b` : "B"}onne nouvelle : votre commande vient d’être expédiée.`),
      referenceBox(o),
      tracking.length ? p(tracking.join("<br>")) : "",
      o.trackingUrl
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 12px;"><tr><td style="background:${C.orange};border:2px solid ${C.brun};">
            <a href="${esc(o.trackingUrl)}" style="display:inline-block;padding:12px 20px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${C.brun};text-decoration:none;">Suivre mon colis</a>
          </td></tr></table>`
        : "",
      label("Contenu du colis"),
      itemsTable(o, false),
      label("Adresse de livraison"),
      addressBlock(o),
    ].join(""),
  });
  const text = [
    `${name ? `Bonjour ${name}, b` : "B"}onne nouvelle : votre commande vient d’être expédiée.`,
    "",
    `Commande ${o.reference}`,
    ...(o.carrier ? [`Transporteur : ${o.carrier}`] : []),
    ...(o.trackingNumber ? [`Numéro de suivi : ${o.trackingNumber}`] : []),
    ...(o.trackingUrl ? [`Suivre mon colis : ${o.trackingUrl}`] : []),
    "",
    "Contenu du colis :",
    textItems(o, false),
    "",
    "Adresse de livraison :",
    ...addressLines(o),
  ].join("\n");
  return { subject, html, text: text + textFooter() };
}
