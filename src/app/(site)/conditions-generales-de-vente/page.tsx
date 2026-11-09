import { LegalDraft } from "@/components/LegalDraft";
import { pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata({
    title: "Conditions générales de vente",
    description: "Conditions générales de vente de la boutique en ligne Maison Kayes.",
    path: "/conditions-generales-de-vente",
  }),
  robots: { index: false },
};

export default function CgvPage() {
  return (
    <LegalDraft
      title="Conditions de vente"
      sections={[
        {
          title: "Vendeur",
          items: ["Nom ou dénomination, forme juridique, adresse, numéro d’entreprise (BCE), numéro de TVA, e-mail de contact"],
        },
        {
          title: "Produits et prix",
          items: [
            "Prix indiqués en euros, toutes taxes comprises (régime de TVA à préciser)",
            "Frais de livraison indiqués avant le paiement, selon la zone choisie",
            "Pièces artisanales : précisions sur les variations possibles d’une pièce à l’autre",
          ],
        },
        {
          title: "Commande et paiement",
          items: [
            "Étapes de la commande et moment où le contrat est conclu",
            "Paiement sécurisé par Stripe (moyens de paiement acceptés à lister)",
            "Confirmation de commande envoyée par e-mail",
          ],
        },
        {
          title: "Livraison",
          items: [
            "Zones desservies : Belgique, Union européenne, et le cas échéant Suisse, Royaume-Uni, Norvège, Islande",
            "Délais de préparation et de livraison, transporteur",
            "Hors Union européenne : droits de douane et taxes éventuels à la charge du client",
          ],
        },
        {
          title: "Droit de rétractation",
          items: [
            "Délai de 14 jours à compter de la réception pour se rétracter, sans justification",
            "Modalités de retour, frais de retour, délai de remboursement (14 jours maximum)",
            "Modèle de formulaire de rétractation",
          ],
        },
        {
          title: "Garanties",
          items: ["Garantie légale de conformité de deux ans", "Procédure en cas de défaut ou de colis endommagé"],
        },
        {
          title: "Litiges",
          items: ["Droit applicable et tribunaux compétents", "Service de médiation pour les consommateurs (à préciser)"],
        },
      ]}
    />
  );
}
