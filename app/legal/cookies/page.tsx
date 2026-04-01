'use client';

import Link from 'next/link';

export default function CookiesPage() {
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
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Politique Cookies</h1>
          <p className="text-sm text-surface-400 mb-10">Derniere mise a jour : 1er avril 2026</p>

          {/* 1. Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              1. Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p className="text-surface-600 leading-relaxed">
              Un cookie est un petit fichier texte stocke sur votre navigateur lorsque vous visitez
              un site web. Les cookies permettent au site de memoriser certaines informations entre
              les visites, comme votre session de connexion.
            </p>
          </section>

          {/* 2. Cookies utilises */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              2. Cookies utilises par Afrikalytics
            </h2>
            <p className="text-surface-600 leading-relaxed mb-4">
              Afrikalytics utilise exclusivement des cookies{' '}
              <strong className="text-surface-700">strictement necessaires</strong> au
              fonctionnement du service d&apos;authentification. Aucun cookie de tracking, de
              publicite ou de mesure d&apos;audience tiers n&apos;est utilise.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">
                      Nom du cookie
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">Finalite</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-surface-700">Duree</th>
                  </tr>
                </thead>
                <tbody className="text-surface-600">
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4">
                      <code className="bg-surface-100 px-2 py-0.5 rounded text-sm text-surface-700">
                        auth-token
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      Jeton d&apos;authentification JWT. Permet de verifier l&apos;identite de
                      l&apos;utilisateur a chaque requete sans renvoyer ses identifiants.
                    </td>
                    <td className="py-3 px-4">httpOnly</td>
                    <td className="py-3 px-4">7 jours</td>
                  </tr>
                  <tr className="border-b border-surface-100">
                    <td className="py-3 px-4">
                      <code className="bg-surface-100 px-2 py-0.5 rounded text-sm text-surface-700">
                        auth-user
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      Informations de profil de l&apos;utilisateur (nom, email, role, plan). Permet
                      d&apos;afficher l&apos;interface personnalisee sans requete supplementaire au
                      serveur.
                    </td>
                    <td className="py-3 px-4">httpOnly</td>
                    <td className="py-3 px-4">7 jours</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">
                      <code className="bg-surface-100 px-2 py-0.5 rounded text-sm text-surface-700">
                        auth-refresh-token
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      Jeton de renouvellement. Permet de generer un nouveau jeton
                      d&apos;authentification a son expiration sans redemander les identifiants de
                      l&apos;utilisateur.
                    </td>
                    <td className="py-3 px-4">httpOnly</td>
                    <td className="py-3 px-4">30 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Pas de cookies tiers */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              3. Absence de cookies tiers
            </h2>
            <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
              <p className="text-surface-700 leading-relaxed">
                Afrikalytics <strong>n&apos;utilise aucun cookie tiers</strong>. Cela signifie que :
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-surface-600 mt-3">
                <li>Aucun cookie de tracking (Google Analytics, Facebook Pixel, etc.)</li>
                <li>Aucun cookie publicitaire ou de retargeting</li>
                <li>Aucun cookie de reseau social (partage, like, etc.)</li>
                <li>
                  Aucune transmission de donnees de navigation a des tiers a des fins commerciales
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Base legale */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">4. Base legale</h2>
            <p className="text-surface-600 leading-relaxed">
              Les cookies utilises par Afrikalytics sont des{' '}
              <strong className="text-surface-700">cookies strictement necessaires</strong> au
              fonctionnement du service. Conformement a l&apos;article 5(3) de la directive ePrivacy
              (2002/58/CE) et aux recommandations de la CNIL, ces cookies sont{' '}
              <strong className="text-surface-700">exemptes de consentement prealable</strong> car
              ils sont indispensables a la fourniture du service explicitement demande par
              l&apos;utilisateur (authentification).
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              Cette exemption est egalement conforme aux legislations locales applicables :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-600 mt-3">
              <li>
                <strong className="text-surface-700">Senegal</strong> : Loi n&deg;2008-12 relative a
                la protection des donnees a caractere personnel
              </li>
              <li>
                <strong className="text-surface-700">Cote d&apos;Ivoire</strong> : Loi
                n&deg;2013-450 relative a la protection des donnees a caractere personnel
              </li>
              <li>
                <strong className="text-surface-700">Benin</strong> : Loi n&deg;2009-09 portant
                protection des donnees a caractere personnel (APDP)
              </li>
            </ul>
          </section>

          {/* 5. Gestion des cookies */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              5. Gestion des cookies dans votre navigateur
            </h2>
            <p className="text-surface-600 leading-relaxed">
              Vous pouvez a tout moment configurer votre navigateur pour refuser ou supprimer les
              cookies. Toutefois, la suppression des cookies d&apos;authentification Afrikalytics
              entrainera la deconnexion automatique de votre compte et la necessite de vous
              reconnecter.
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              Pour gerer les cookies dans votre navigateur :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-600 mt-3">
              <li>
                <strong className="text-surface-700">Chrome</strong> : Parametres &gt;
                Confidentialite et securite &gt; Cookies et autres donnees de site
              </li>
              <li>
                <strong className="text-surface-700">Firefox</strong> : Parametres &gt; Vie privee
                et securite &gt; Cookies et donnees de sites
              </li>
              <li>
                <strong className="text-surface-700">Safari</strong> : Preferences &gt;
                Confidentialite &gt; Gestion des donnees de sites web
              </li>
              <li>
                <strong className="text-surface-700">Edge</strong> : Parametres &gt; Cookies et
                autorisations de site &gt; Cookies et donnees de site
              </li>
            </ul>
          </section>

          {/* 6. Contact */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">6. Contact</h2>
            <p className="text-surface-600 leading-relaxed">
              Pour toute question relative a notre utilisation des cookies, vous pouvez contacter
              notre Delegue a la Protection des Donnees :
            </p>
            <div className="bg-surface-50 rounded-xl p-5 border border-surface-200 mt-4">
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
          </section>

          {/* 7. Liens */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">7. Documents associes</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/cgu"
                  className="text-primary-600 hover:text-primary-700 underline text-sm"
                >
                  Conditions Generales d&apos;Utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/confidentialite"
                  className="text-primary-600 hover:text-primary-700 underline text-sm"
                >
                  Politique de Confidentialite
                </Link>
              </li>
            </ul>
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
