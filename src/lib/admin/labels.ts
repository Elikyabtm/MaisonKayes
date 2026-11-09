import type { FulfillmentStatus, PaymentStatus } from "@/db/schema";

export const paymentLabels: Record<PaymentStatus, string> = {
  en_attente: "En attente",
  paye: "Payé",
  echoue: "Échoué",
  rembourse: "Remboursé",
  partiellement_rembourse: "Remb. partiel",
};

export const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  a_preparer: "À préparer",
  expediee: "Expédiée",
  remise: "Remise",
  annulee: "Annulée",
};

export const kindLabels = { produit: "Photo produit", portee: "Portée", detail: "Détail", scene: "Mise en scène" } as const;

export type StockLevel = "inconnu" | "rupture" | "bas" | "ok";

export function stockLevel(stock: number | null, threshold: number): StockLevel {
  if (stock === null) return "inconnu";
  if (stock <= 0) return "rupture";
  if (stock <= threshold) return "bas";
  return "ok";
}

export const stockLevelLabels: Record<StockLevel, string> = {
  inconnu: "Stock à renseigner",
  rupture: "Rupture",
  bas: "Stock bas",
  ok: "En stock",
};

/** Messages de retour après une action (codes passés dans l’URL : ?ok=… / ?erreur=…). */
export const flashMessages: Record<string, string> = {
  statut: "Statut de la commande mis à jour.",
  suivi: "Informations d’expédition enregistrées.",
  annulee: "Commande annulée.",
  annulee_stock: "Commande annulée, articles remis en stock.",
  stock: "Stock mis à jour.",
  seuil: "Seuil d’alerte enregistré.",
  fiche: "Fiche enregistrée.",
  creee: "Fiche créée. Elle reste masquée tant que vous ne la rendez pas visible.",
  variante: "Variantes enregistrées.",
  variante_ajoutee: "Variante ajoutée.",
  variante_supprimee: "Variante supprimée.",
  photos: "Photos ajoutées.",
  photo: "Photo mise à jour.",
  photo_supprimee: "Photo supprimée.",
  ordre: "Ordre enregistré.",
  // Erreurs
  introuvable: "Élément introuvable.",
  quantite: "Indiquez une quantité entière positive.",
  stock_insuffisant: "Stock insuffisant pour ce retrait.",
  prix: "Prix invalide : indiquez un montant comme 25 ou 25,50.",
  nom: "Le nom est obligatoire.",
  categorie: "Catégorie inconnue.",
  photo_format: "Format non pris en charge : envoyez des photos JPEG, PNG, WebP, HEIC ou AVIF.",
  photo_poids: "Photo trop lourde (20 Mo maximum par fichier).",
  photo_vide: "Choisissez au moins une photo.",
  variante_vendue: "Cette variante a déjà été vendue : désactivez-la plutôt que de la supprimer.",
  variante_derniere: "Une fiche doit garder au moins une variante.",
  annulee_deja: "Cette commande est annulée : son statut ne peut plus changer.",
  motif: "Choisissez un motif.",
};
