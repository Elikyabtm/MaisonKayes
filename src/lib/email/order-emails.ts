import "server-only";
import { and, asc, eq, lt, or } from "drizzle-orm";
import { site } from "@/data/site";
import { getDb, schema } from "@/db";
import type { OrderEmailKind } from "@/db/schema";
import { EmailError, sendEmail } from "./resend";
import { confirmationEmail, internalNotificationEmail, shippedEmail, type EmailOrder, type RenderedEmail } from "./templates";

const { orders, orderItems, orderEmails } = schema;

/** Un envoi resté « en cours » plus longtemps (processus interrompu) peut être relancé. */
const STALE_MS = 10 * 60 * 1000;

export const orderEmailLabels: Record<OrderEmailKind, string> = {
  confirmation: "Confirmation au client",
  notification_interne: "Notification « Nouvelle commande à préparer »",
  expedition: "Avis d’expédition au client",
};

/** Adresse de gestion qui reçoit les nouvelles commandes. */
export const managementEmail = () => process.env.ORDER_NOTIFICATION_EMAIL || site.contact.email || null;

export type SendResult = { kind: OrderEmailKind; outcome: "envoye" | "echec" | "deja_traite"; error?: string };

async function loadOrder(orderId: number): Promise<EmailOrder | null> {
  const db = await getDb();
  const [o] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!o) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.id));
  return { ...o, reference: o.reference ?? `#${o.id}`, items };
}

function render(kind: OrderEmailKind, order: EmailOrder): RenderedEmail {
  if (kind === "confirmation") return confirmationEmail(order);
  if (kind === "notification_interne") return internalNotificationEmail(order);
  return shippedEmail(order);
}

const recipientFor = (kind: OrderEmailKind, order: EmailOrder) =>
  kind === "notification_interne" ? managementEmail() : order.customerEmail;

/**
 * Envoie un e-mail de commande au plus une fois.
 * 1. Réservation : insertion d’une ligne unique (commande, type). Si elle existe déjà, rien n’est envoyé,
 *    sauf relance explicite (`retry`) d’un envoi en échec ou bloqué.
 * 2. Envoi via Resend, puis statut « envoyé » ou « échec » (avec le message d’erreur).
 * Ne lève jamais d’exception : un échec d’envoi n’affecte pas la commande.
 */
export async function sendOrderEmail(orderId: number, kind: OrderEmailKind, opts: { retry?: boolean } = {}): Promise<SendResult> {
  const db = await getDb();
  try {
    const order = await loadOrder(orderId);
    if (!order) return { kind, outcome: "echec", error: "Commande introuvable." };
    const to = recipientFor(kind, order);

    // — Réservation
    const now = new Date();
    let [claim] = await db
      .insert(orderEmails)
      .values({ orderId, kind, recipient: to ?? "", status: "en_cours", attempts: 1 })
      .onConflictDoNothing({ target: [orderEmails.orderId, orderEmails.kind] })
      .returning();
    if (!claim && opts.retry) {
      const [current] = await db
        .select({ attempts: orderEmails.attempts })
        .from(orderEmails)
        .where(and(eq(orderEmails.orderId, orderId), eq(orderEmails.kind, kind)))
        .limit(1);
      [claim] = await db
        .update(orderEmails)
        .set({ status: "en_cours", recipient: to ?? "", attempts: (current?.attempts ?? 0) + 1, lastError: null, updatedAt: now })
        .where(
          and(
            eq(orderEmails.orderId, orderId),
            eq(orderEmails.kind, kind),
            or(
              eq(orderEmails.status, "echec"),
              and(eq(orderEmails.status, "en_cours"), lt(orderEmails.updatedAt, new Date(now.getTime() - STALE_MS))),
            ),
          ),
        )
        .returning();
    }
    if (!claim) return { kind, outcome: "deja_traite" };

    // — Envoi
    try {
      if (!to) throw new EmailError(kind === "notification_interne" ? "Aucune adresse de gestion configurée (ORDER_NOTIFICATION_EMAIL)." : "Le client n’a pas d’adresse e-mail.");
      const rendered = render(kind, order);
      const { id } = await sendEmail({
        to,
        ...rendered,
        // La tentative fait partie de la clé : une relance après correction n’est pas bloquée par l’échec précédent.
        idempotencyKey: `mk-commande-${orderId}-${kind}-${claim.attempts}`,
        tags: { type: kind, commande: order.reference.replace(/[^A-Za-z0-9_-]/g, "") },
      });
      await db
        .update(orderEmails)
        .set({ status: "envoye", providerId: id, sentAt: new Date(), lastError: null, updatedAt: new Date() })
        .where(eq(orderEmails.id, claim.id));
      return { kind, outcome: "envoye" };
    } catch (error) {
      const message = error instanceof EmailError ? error.message : `Erreur inattendue : ${error instanceof Error ? error.message : String(error)}`;
      await db
        .update(orderEmails)
        .set({ status: "echec", lastError: message.slice(0, 500), updatedAt: new Date() })
        .where(eq(orderEmails.id, claim.id));
      console.error(`[e-mails] ${kind} pour la commande ${order.reference} : ${message}`);
      return { kind, outcome: "echec", error: message };
    }
  } catch (error) {
    // Base indisponible, etc. : on journalise sans jamais faire échouer l’appelant.
    console.error(`[e-mails] ${kind} pour la commande ${orderId} : traitement impossible`, error);
    return { kind, outcome: "echec", error: "Traitement impossible." };
  }
}

/** Paiement confirmé et commande enregistrée : confirmation au client + notification interne. */
export async function sendPaidOrderEmails(orderId: number) {
  return Promise.all([sendOrderEmail(orderId, "confirmation"), sendOrderEmail(orderId, "notification_interne")]);
}
