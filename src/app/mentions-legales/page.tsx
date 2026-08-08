import type { Metadata } from "next";
import { LegalLayout, AComplter } from "../LegalLayout";

export const metadata: Metadata = {
  title: "Mentions légales — Walletiz",
  description: "Mentions légales du service Walletiz.",
};

export default function MentionsLegales() {
  return (
    <LegalLayout titre="Mentions légales" maj="août 2026">
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>walletiz.fr</strong> et le service Walletiz sont édités par :
      </p>
      <ul>
        <li>Nom / Raison sociale : <AComplter>[à compléter — votre nom ou raison sociale]</AComplter></li>
        <li>Statut juridique : <AComplter>[à compléter — ex. micro-entreprise / SASU / EI]</AComplter></li>
        <li>SIREN / SIRET : <AComplter>[à compléter]</AComplter></li>
        <li>Siège / adresse : <AComplter>[à compléter]</AComplter></li>
        <li>
          Numéro de TVA intracommunautaire :{" "}
          <AComplter>[à compléter, ou « TVA non applicable, art. 293 B du CGI » si micro-entreprise]</AComplter>
        </li>
        <li>Directeur de la publication : Samuel Ursule</li>
        <li>E-mail : <a href="mailto:walletiz.fr@gmail.com">walletiz.fr@gmail.com</a></li>
        <li>Téléphone : +590 690 98 85 38</li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>Le site est hébergé par :</p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis —{" "}
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
        </li>
      </ul>
      <p>
        Les données (comptes, cartes de fidélité, historiques) sont stockées via{" "}
        <strong>Supabase</strong> (Supabase Inc.), sur des serveurs situés dans l&apos;Union
        européenne. Les paiements sont gérés par <strong>Stripe</strong> (Stripe Payments Europe,
        Ltd.).
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site et du service Walletiz (marque, logo, textes,
        interfaces, code) est protégé par le droit de la propriété intellectuelle et demeure la
        propriété exclusive de l&apos;éditeur. Toute reproduction ou réutilisation sans
        autorisation est interdite.
      </p>

      <h2>4. Responsabilité</h2>
      <p>
        L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la disponibilité du
        service, sans pouvoir garantir une absence totale d&apos;erreurs ou d&apos;interruptions.
        L&apos;éditeur ne saurait être tenu responsable des dommages indirects liés à
        l&apos;utilisation du service.
      </p>

      <h2>5. Contact</h2>
      <p>
        Pour toute question, vous pouvez nous écrire à{" "}
        <a href="mailto:walletiz.fr@gmail.com">walletiz.fr@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
