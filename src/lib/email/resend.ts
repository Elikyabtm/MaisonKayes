import "server-only";
import { site } from "@/data/site";

/**
 * Envoi via l’API HTTP de Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Configuration (variables d’environnement) :
 * - RESEND_API_KEY : clé d’API Resend (obligatoire)
 * - EMAIL_FROM : expéditeur sur le domaine vérifié, ex. « Maison Kayes <commandes@maisonkayes.be> » (obligatoire)
 * - EMAIL_REPLY_TO : adresse de réponse (contact@maisonkayes.be par défaut)
 */
export class EmailError extends Error {}

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Clé d’idempotence transmise à Resend (seconde protection contre les doublons). */
  idempotencyKey: string;
  tags?: Record<string, string>;
};

export function emailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? "",
    replyTo: process.env.EMAIL_REPLY_TO || site.contact.email || undefined,
    // Uniquement pour les tests locaux (faux serveur Resend).
    apiBase: process.env.RESEND_API_BASE || "https://api.resend.com",
  };
}

export const emailConfigured = () => {
  const c = emailConfig();
  return Boolean(c.apiKey && c.from);
};

export async function sendEmail(email: OutgoingEmail): Promise<{ id: string }> {
  const c = emailConfig();
  if (!c.apiKey) throw new EmailError("Envoi d’e-mails non configuré : RESEND_API_KEY manquant.");
  if (!c.from) throw new EmailError("Envoi d’e-mails non configuré : EMAIL_FROM manquant.");

  let res: Response;
  try {
    res = await fetch(`${c.apiBase}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.idempotencyKey,
      },
      body: JSON.stringify({
        from: c.from,
        to: [email.to],
        ...(c.replyTo && { reply_to: c.replyTo }),
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.tags && { tags: Object.entries(email.tags).map(([name, value]) => ({ name, value })) }),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new EmailError(`Service d’envoi injoignable (${error instanceof Error ? error.message : "erreur réseau"}).`);
  }

  const body = (await res.json().catch(() => null)) as { id?: string; message?: string; name?: string } | null;
  if (!res.ok || !body?.id) {
    throw new EmailError(`Resend a refusé l’envoi (HTTP ${res.status}${body?.message ? ` : ${body.message}` : ""}).`);
  }
  return { id: body.id };
}
