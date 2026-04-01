'use client';

import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors mb-8"
        >
          <span aria-hidden="true">&larr;</span>
          Retour au dashboard
        </Link>

        <article className="bg-white rounded-2xl shadow-card p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Politique de Confidentialite</h1>
          <p className="text-sm text-surface-400 mb-10">Derniere mise a jour : 1er avril 2026</p>

          {/* 1. Donnees collectees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">1. Donnees collectees</h2>
            <p className="text-surface-600 leading-relaxed mb-3">
              Dans le cadre de l&apos;utilisation de la plateforme Afrikalytics, nous collectons les
              categories de donnees suivantes :
            </p>
            <div className="space-y-3">
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
                <h3 className="font-semibold text-surface-700 text-sm mb-1">
                  Donnees d&apos;identification
                </h3>
                <p className="text-surface-600 text-sm">
                  Nom complet, adresse email, mot de passe (chiffre), role et plan
                  d&apos;abonnement.
                </p>
              </div>
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
                <h3 className="font-semibold text-surface-700 text-sm mb-1">
                  Donnees d&apos;utilisation
                </h3>
                <p className="text-surface-600 text-sm">
                  Etudes consultees, insights lus, rapports telecharges, actions realisees sur le
                  tableau de bord, horodatages de connexion.
                </p>
              </div>
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
                <h3 className="font-semibold text-surface-700 text-sm mb-1">Donnees importees</h3>
                <p className="text-surface-600 text-sm">
                  Fichiers de donnees (CSV, Excel) importes par l&apos;utilisateur dans le cadre de
                  la creation d&apos;etudes personnalisees. Ces donnees restent la propriete de
                  l&apos;utilisateur.
                </p>
              </div>
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
                <h3 className="font-semibold text-surface-700 text-sm mb-1">Donnees de paiement</h3>
                <p className="text-surface-600 text-sm">
                  Les informations de paiement (mobile money, carte bancaire) sont traitees
                  exclusivement par notre prestataire PayDunya. Afrikalytics ne stocke aucun numero
                  de carte ou identifiant de compte mobile.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Finalites */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              2. Finalites du traitement
            </h2>
            <p className="text-surface-600 leading-relaxed mb-3">
              Vos donnees personnelles sont traitees pour les finalites suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-600">
              <li>
                <strong className="text-surface-700">Fourniture du service</strong> : creation et
                gestion de votre compte, acces aux etudes, insights et rapports, personnalisation du
                tableau de bord
              </li>
              <li>
                <strong className="text-surface-700">Analytics internes</strong> : amelioration de
                la plateforme, analyse des usages, detection d&apos;anomalies et optimisation des
                performances
              </li>
              <li>
                <strong className="text-surface-700">Communication</strong> : notifications liees au
                service (mises a jour, alertes de securite), newsletter (avec consentement
                explicite), emails transactionnels (confirmation de paiement, reinitialisation de
                mot de passe)
              </li>
              <li>
                <strong className="text-surface-700">Securite</strong> : prevention des fraudes,
                journalisation des acces (audit logs), protection contre les intrusions
              </li>
            </ul>
          </section>

          {/* 3. Base legale */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              3. Base legale du traitement
            </h2>
            <p className="text-surface-600 leading-relaxed mb-3">
              Les traitements de donnees reposent sur les bases legales suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-600">
              <li>
                <strong className="text-surface-700">Execution du contrat</strong> : traitement
                necessaire a la fourniture du service Afrikalytics (creation de compte, acces aux
                fonctionnalites, gestion des abonnements)
              </li>
              <li>
                <strong className="text-surface-700">Consentement</strong> : inscription a la
                newsletter, utilisation de cookies non essentiels (le cas echeant)
              </li>
              <li>
                <strong className="text-surface-700">Interet legitime</strong> : securite de la
                plateforme, amelioration du service, detection de fraudes
              </li>
              <li>
                <strong className="text-surface-700">Obligation legale</strong> : conservation des
                journaux d&apos;audit, reponse aux requisitions judiciaires
              </li>
            </ul>
          </section>

          {/* 4. Duree de conservation */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              4. Duree de conservation
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">
                      Type de donnees
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">
                      Duree de conservation
                    </th>
                  </tr>
                </thead>
                <tbody className="text-surface-600">
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4">Donnees de compte</td>
                    <td className="py-3 px-4">Duree du compte actif + 1 an apres suppression</td>
                  </tr>
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4">Donnees importees</td>
                    <td className="py-3 px-4">
                      Duree du compte actif, supprimees sous 30 jours apres resiliation
                    </td>
                  </tr>
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4">Journaux d&apos;audit (audit logs)</td>
                    <td className="py-3 px-4">1 an glissant</td>
                  </tr>
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4">Donnees de paiement</td>
                    <td className="py-3 px-4">5 ans (obligation comptable senegalaise)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Cookies d&apos;authentification</td>
                    <td className="py-3 px-4">7 a 30 jours (voir Politique Cookies)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Sous-traitants */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              5. Sous-traitants et partenaires
            </h2>
            <p className="text-surface-600 leading-relaxed mb-3">
              Afrikalytics fait appel aux sous-traitants suivants pour assurer le fonctionnement de
              la plateforme :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">
                      Prestataire
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">Fonction</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">
                      Localisation
                    </th>
                  </tr>
                </thead>
                <tbody className="text-surface-600">
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4 font-medium">Vercel</td>
                    <td className="py-3 px-4">Hebergement frontend</td>
                    <td className="py-3 px-4">Etats-Unis</td>
                  </tr>
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4 font-medium">Railway</td>
                    <td className="py-3 px-4">Hebergement backend et base de donnees</td>
                    <td className="py-3 px-4">Etats-Unis</td>
                  </tr>
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4 font-medium">Resend</td>
                    <td className="py-3 px-4">Envoi d&apos;emails transactionnels</td>
                    <td className="py-3 px-4">Etats-Unis</td>
                  </tr>
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4 font-medium">PayDunya</td>
                    <td className="py-3 px-4">Traitement des paiements (FCFA / mobile money)</td>
                    <td className="py-3 px-4">Senegal</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Sentry</td>
                    <td className="py-3 px-4">Suivi des erreurs et monitoring</td>
                    <td className="py-3 px-4">Etats-Unis</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Transferts internationaux */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              6. Transferts internationaux de donnees
            </h2>
            <p className="text-surface-600 leading-relaxed">
              Certains de nos sous-traitants sont situes aux Etats-Unis. Ces transferts sont
              encadres par des{' '}
              <strong className="text-surface-700">clauses contractuelles types (CCT)</strong>{' '}
              approuvees par la Commission europeenne, garantissant un niveau de protection adequat
              de vos donnees personnelles conformement au RGPD et aux legislations locales
              applicables (Loi senegalaise n&deg;2008-12, Loi ivoirienne n&deg;2013-450, Loi
              beninoise n&deg;2009-09).
            </p>
          </section>

          {/* 7. Droits des utilisateurs */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              7. Droits des utilisateurs
            </h2>
            <p className="text-surface-600 leading-relaxed mb-3">
              Conformement a la reglementation applicable, vous disposez des droits suivants sur vos
              donnees personnelles :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-600">
              <li>
                <strong className="text-surface-700">Droit d&apos;acces</strong> : obtenir une copie
                de vos donnees personnelles
              </li>
              <li>
                <strong className="text-surface-700">Droit de rectification</strong> : corriger des
                donnees inexactes ou incompletes
              </li>
              <li>
                <strong className="text-surface-700">Droit de suppression</strong> : demander
                l&apos;effacement de vos donnees (sous reserve des obligations legales de
                conservation)
              </li>
              <li>
                <strong className="text-surface-700">Droit a la portabilite</strong> : recevoir vos
                donnees dans un format structure, couramment utilise et lisible par machine
              </li>
              <li>
                <strong className="text-surface-700">Droit d&apos;opposition</strong> : vous opposer
                au traitement de vos donnees pour motif legitime
              </li>
              <li>
                <strong className="text-surface-700">Droit a la limitation du traitement</strong> :
                demander la suspension du traitement dans certains cas
              </li>
            </ul>
            <p className="text-surface-600 leading-relaxed mt-4">
              Pour exercer ces droits, contactez notre Delegue a la Protection des Donnees (DPO) a
              l&apos;adresse :{' '}
              <a
                href="mailto:dpo@afrikalytics.com"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                dpo@afrikalytics.com
              </a>
              . Nous nous engageons a repondre dans un delai de 30 jours.
            </p>
          </section>

          {/* 8. Cookies */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">8. Cookies</h2>
            <p className="text-surface-600 leading-relaxed">
              Afrikalytics utilise exclusivement des cookies httpOnly strictement necessaires au
              fonctionnement du service d&apos;authentification. Aucun cookie tiers, de tracking ou
              de publicite n&apos;est utilise. Pour plus de details, consultez notre{' '}
              <Link
                href="/legal/cookies"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Politique Cookies
              </Link>
              .
            </p>
          </section>

          {/* 9. Contact DPO */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              9. Contact &mdash; Delegue a la Protection des Donnees
            </h2>
            <div className="bg-surface-50 rounded-xl p-5 border border-surface-200">
              <p className="text-surface-700 font-medium">Afrikalytics &mdash; DPO</p>
              <p className="text-surface-600 text-sm mt-1">
                Marketym / H&amp;C Executive Education
              </p>
              <p className="text-surface-600 text-sm mt-1">Dakar, Senegal</p>
              <p className="text-surface-600 text-sm mt-1">
                Email :{' '}
                <a
                  href="mailto:dpo@afrikalytics.com"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  dpo@afrikalytics.com
                </a>
              </p>
            </div>
            <p className="text-surface-600 leading-relaxed mt-4">
              Vous disposez egalement du droit d&apos;introduire une reclamation aupres de
              l&apos;autorite de protection des donnees competente (CDP au Senegal, ARTCI en Cote
              d&apos;Ivoire, APDP au Benin).
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-surface-200 pt-6 mt-10">
            <p className="text-sm text-surface-400 text-center">
              &copy; 2026 Afrikalytics by Marketym &mdash; Dakar, Senegal
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
