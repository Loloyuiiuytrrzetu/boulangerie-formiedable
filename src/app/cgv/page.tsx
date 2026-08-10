import type { Metadata } from "next";
import { LegalLayout } from "../LegalLayout";

export const metadata: Metadata = {
  title: "Conditions Générales — Walletiz",
  description: "Conditions Générales de Vente et d'Utilisation du service Walletiz.",
};

export default function CGV() {
  return (
    <LegalLayout titre="Conditions Générales de Vente et d'Utilisation" maj="août 2026">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent l&apos;utilisation du service <strong>Walletiz</strong>,
        une plateforme de carte de fidélité digitale destinée aux commerces (le « Service »),
        éditée par <strong>Walletiz</strong> (l&apos;« Éditeur »). Toute souscription implique
        l&apos;acceptation des présentes conditions.
      </p>

      <h2>2. Description du service</h2>
      <p>Walletiz permet au commerçant (le « Client ») notamment de :</p>
      <ul>
        <li>créer une ou plusieurs cartes de fidélité digitales ;</li>
        <li>attribuer des tampons à ses clients via un QR code ;</li>
        <li>envoyer des notifications push à ses clients abonnés ;</li>
        <li>consulter des statistiques et gérer sa base de clients.</li>
      </ul>

      <h2>3. Tarifs</h2>
      <ul>
        <li>Abonnement mensuel : <strong>54&nbsp;€/mois</strong>, sans engagement.</li>
        <li>Abonnement annuel : <strong>518&nbsp;€/an</strong> (soit une remise par rapport au mensuel).</li>
        <li>Frais de mise en place : <strong>20&nbsp;€</strong>, facturés une seule fois à l&apos;inscription.</li>
        <li>
          Supports de comptoir personnalisés (optionnels) : à partir de <strong>20&nbsp;€</strong> l&apos;unité.
        </li>
      </ul>
      <p>
        Les prix sont indiqués en euros. Une période d&apos;essai gratuite peut être proposée ; à
        son terme, l&apos;abonnement choisi démarre automatiquement.
      </p>

      <h2>4. Paiement</h2>
      <p>
        Les paiements sont traités de manière sécurisée par <strong>Stripe</strong>. Le Client
        autorise le prélèvement récurrent correspondant à la formule choisie (mensuelle ou
        annuelle) jusqu&apos;à résiliation.
      </p>

      <h2>5. Durée et résiliation</h2>
      <p>
        L&apos;abonnement mensuel est sans engagement et peut être résilié à tout moment depuis
        l&apos;espace du Client ; il prend fin à l&apos;échéance de la période en cours.
        L&apos;abonnement annuel est valable douze (12) mois. Aucun remboursement au prorata
        n&apos;est dû pour une période entamée, sauf disposition légale contraire.
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        Le Service s&apos;adressant à des professionnels dans le cadre de leur activité, le droit
        de rétractation de 14 jours prévu pour les consommateurs ne s&apos;applique en principe
        pas.
      </p>

      <h2>7. Obligations du Client</h2>
      <p>
        Le Client s&apos;engage à utiliser le Service conformément à la loi, à ne collecter les
        données de ses propres clients qu&apos;avec leur information, et à obtenir leur consentement
        pour l&apos;envoi de notifications. Le Client est responsable du contenu qu&apos;il diffuse
        via Walletiz.
      </p>

      <h2>8. Disponibilité et responsabilité</h2>
      <p>
        L&apos;Éditeur met en œuvre les moyens raisonnables pour assurer la disponibilité du
        Service, sans garantie d&apos;absence d&apos;interruption. Sa responsabilité ne saurait être
        engagée pour les dommages indirects (perte de chiffre d&apos;affaires, de données du fait du
        Client, etc.).
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans notre{" "}
        <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>10. Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de litige, une solution
        amiable sera recherchée avant toute action judiciaire.
      </p>
    </LegalLayout>
  );
}
