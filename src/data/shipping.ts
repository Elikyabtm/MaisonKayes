/**
 * Zones de livraison. Chaque zone correspond à un tarif créé dans le tableau de bord Stripe
 * (Produits → Tarifs de livraison), dont l’identifiant `shr_…` est fourni par variable d’environnement.
 * Une zone sans tarif configuré n’est pas proposée.
 */

const EU_WITHOUT_BE = [
  "AT", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export type ShippingZone = {
  id: "be" | "ue" | "europe";
  label: string;
  /** Codes pays ISO acceptés à l’adresse de livraison. */
  countries: readonly string[];
  /** Nom de la variable d’environnement contenant l’identifiant du tarif Stripe. */
  rateEnv: string;
};

export const shippingZones: ShippingZone[] = [
  { id: "be", label: "Belgique", countries: ["BE"], rateEnv: "STRIPE_SHIPPING_RATE_BE" },
  { id: "ue", label: "Autres pays de l’Union européenne", countries: EU_WITHOUT_BE, rateEnv: "STRIPE_SHIPPING_RATE_EU" },
  // Hors UE : droits de douane possibles à la charge du client (à préciser dans les CGV).
  { id: "europe", label: "Suisse, Royaume-Uni, Norvège, Islande", countries: ["CH", "GB", "NO", "IS"], rateEnv: "STRIPE_SHIPPING_RATE_EUROPE" },
];

export const getZone = (id: string) => shippingZones.find((z) => z.id === id);
