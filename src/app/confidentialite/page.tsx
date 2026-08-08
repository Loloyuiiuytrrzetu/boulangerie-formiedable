import type { Metadata } from "next";
import { LegalLayout } from "../LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Walletiz",
  description: "Comment Walletiz traite les données personnelles (RGPD).",
};

export default function Confidentialite() {
  return (
    <LegalLayout titre="Politique de confidentialité" maj="août 2026">
      <p>
        La présente politique explique comment Walletiz collecte et traite les données
        personnelles, conformément au Règlement Général sur la Protection des Données (RGPD) et à
        la loi Informatique et Libertés.
      </p>

      <h2>1. Données collectées</h2>
      <h3>Côté commerçant (Client Walletiz)</h3>
      <ul>
        <li>e-mail, nom du commerce, langue, fuseau horaire ;</li>
        <li>données d&apos;abonnement et de paiement (gérées par Stripe).</li>
      </ul>
      <h3>Côté client final du commerce</h3>
      <ul>
        <li>numéro de téléphone ;</li>
        <li>prénom / nom (si renseigné) ;</li>
        <li>historique de fidélité (tampons, récompenses) ;</li>
        <li>abonnement aux notifications (le cas échéant).</li>
      </ul>

      <h2>2. Finalités et bases légales</h2>
      <ul>
        <li>
          <strong>Fournir le service de fidélité</strong> (suivi des tampons, récompenses) —
          exécution du contrat / intérêt légitime du commerce ;
        </li>
        <li>
          <strong>Envoyer des notifications push</strong> (promotions, alertes de récompense) —
          fondé sur le <strong>consentement</strong> du client final ;
        </li>
        <li><strong>Gérer l&apos;abonnement et la facturation</strong> — exécution du contrat.</li>
      </ul>

      <h2>3. Destinataires</h2>
      <p>
        Les données ne sont jamais vendues. Elles sont accessibles au commerce concerné et à nos
        sous-traitants techniques strictement nécessaires au fonctionnement :
      </p>
      <ul>
        <li><strong>Supabase</strong> (hébergement de la base de données, UE) ;</li>
        <li><strong>Vercel</strong> (hébergement de l&apos;application) ;</li>
        <li><strong>Stripe</strong> (paiements).</li>
      </ul>

      <h2>4. Durée de conservation</h2>
      <p>
        Les données d&apos;un client final sont conservées tant que sa carte de fidélité est active.
        Un client qui se désinscrit est supprimé de la base. Les données de facturation sont
        conservées selon les obligations légales comptables (généralement 10 ans).
      </p>

      <h2>5. Vos droits</h2>
      <p>
        Conformément au RGPD, toute personne dispose d&apos;un droit d&apos;accès, de rectification,
        d&apos;effacement, d&apos;opposition et de portabilité de ses données. Ces droits
        s&apos;exercent à <a href="mailto:walletiz.fr@gmail.com">walletiz.fr@gmail.com</a>. Vous
        pouvez également introduire une réclamation auprès de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).
      </p>
      <p>
        Un client final peut à tout moment couper les notifications depuis l&apos;onglet « Info » de
        sa carte, ou se désinscrire pour supprimer ses données.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Walletiz utilise uniquement des cookies techniques nécessaires au fonctionnement
        (session de connexion, validité d&apos;un scan). Aucun cookie publicitaire ou de traçage
        tiers n&apos;est utilisé.
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Les échanges sont chiffrés (HTTPS) et l&apos;accès aux données est restreint. Nous mettons
        en œuvre des mesures techniques et organisationnelles raisonnables pour protéger les
        données contre tout accès non autorisé.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative à vos données :{" "}
        <a href="mailto:walletiz.fr@gmail.com">walletiz.fr@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
