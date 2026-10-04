import { LegalDraft } from "@/components/LegalDraft";
import { pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata({ title: "Mentions légales", description: "Mentions légales du site Maison Kayes.", path: "/mentions-legales" }),
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <LegalDraft
      title="Mentions légales"
      sections={[
        {
          title: "Éditeur du site",
          items: [
            "Nom ou dénomination sociale et forme juridique",
            "Responsable de la publication : Fatoumata Gassama (à confirmer)",
            "Adresse du siège ou de domiciliation",
            "Numéro SIREN / SIRET ou immatriculation (RCS, RNE…)",
            "Numéro de TVA intracommunautaire, le cas échéant",
            "Adresse e-mail et/ou téléphone de contact",
          ],
        },
        {
          title: "Conception & développement",
          items: ["Elikya Botomba"],
          final: true,
        },
        {
          title: "Hébergement",
          items: ["Nom, adresse et téléphone de l’hébergeur du site"],
        },
        {
          title: "Propriété intellectuelle",
          items: [
            "Titulaire des droits sur les textes, photographies et logo",
            "Crédits photographiques et mention des visuels générés",
          ],
        },
        {
          title: "Achats",
          items: [
            "Les achats et paiements s’effectuent sur Etsy : renvoyer vers les conditions de la boutique Etsy (lien à renseigner).",
          ],
        },
      ]}
    />
  );
}
