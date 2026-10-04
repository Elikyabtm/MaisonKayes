import { LegalDraft } from "@/components/LegalDraft";
import { pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata({
    title: "Politique de confidentialité",
    description: "Politique de confidentialité du site Maison Kayes.",
    path: "/confidentialite",
  }),
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <LegalDraft
      title="Confidentialité"
      sections={[
        {
          title: "Responsable du traitement",
          items: ["Identité et coordonnées du responsable du traitement"],
        },
        {
          title: "Données collectées par le site",
          items: [
            "Le site ne comporte ni compte client, ni panier, ni formulaire : à confirmer au moment de la mise en ligne.",
            "Journaux techniques de l’hébergeur (adresse IP, date, page consultée) : durée de conservation à préciser.",
            "Mesure d’audience et cookies : aucun outil installé à ce jour ; à mettre à jour si un outil est ajouté.",
          ],
        },
        {
          title: "Achats sur Etsy",
          items: ["Les données de commande et de paiement sont traitées par Etsy : renvoyer vers sa politique de confidentialité."],
        },
        {
          title: "Vos droits",
          items: ["Modalités d’exercice des droits (accès, rectification, effacement…) et adresse de contact", "Possibilité de réclamation auprès de la CNIL"],
        },
      ]}
    />
  );
}
