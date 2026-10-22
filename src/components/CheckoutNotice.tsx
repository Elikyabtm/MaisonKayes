"use client";

import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  annule: "Paiement annulé : aucun montant n’a été débité.",
  indisponible: "Cette pièce n’est plus disponible. Elle vient peut-être d’être commandée.",
  erreur: "Le paiement n’a pas pu démarrer. Réessayez dans un instant ou écrivez à Maison Kayes.",
};

/** Message affiché au retour de Stripe ou après une erreur de commande (?paiement=…). */
export function CheckoutNotice() {
  const key = useSearchParams().get("paiement");
  const message = key ? messages[key] : null;
  if (!message) return null;
  return (
    <p role="status" className="mb-6 border-2 border-brun bg-creme-deep p-4 font-semibold">
      {message}
    </p>
  );
}
