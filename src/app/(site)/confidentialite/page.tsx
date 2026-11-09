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
            "Commandes : nom, adresse de livraison, e-mail et téléphone saisis lors du paiement ; finalité (exécution de la commande) et durée de conservation à préciser.",
            "Compte client (facultatif) : nom, e-mail, mot de passe chiffré, téléphone et adresse de livraison si renseignés ; le client peut les modifier ou supprimer son compte à tout moment depuis son espace.",
            "Newsletter : inscription uniquement sur consentement explicite (case non cochée par défaut), date du consentement conservée, désinscription depuis le compte.",
            "Cookies strictement nécessaires : session du compte client et de l’administration (aucun cookie publicitaire ni de mesure d’audience).",
            "Journaux techniques de l’hébergeur (adresse IP, date, page consultée) : durée de conservation à préciser.",
            "Mesure d’audience et cookies : aucun outil installé à ce jour ; à mettre à jour si un outil est ajouté.",
          ],
        },
        {
          title: "Paiement",
          items: [
            "Les données de paiement sont saisies et traitées par Stripe ; Maison Kayes n’a pas accès aux numéros de carte. Renvoyer vers la politique de confidentialité de Stripe.",
          ],
        },
        {
          title: "Vos droits",
          items: ["Modalités d’exercice des droits (accès, rectification, effacement…) et adresse de contact", "Possibilité de réclamation auprès de l’Autorité de protection des données (APD)"],
        },
      ]}
    />
  );
}
