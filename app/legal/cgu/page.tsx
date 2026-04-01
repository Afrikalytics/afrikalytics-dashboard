'use client';

import Link from 'next/link';

export default function CGUPage() {
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
          <h1 className="text-3xl font-bold text-surface-900 mb-2">
            Conditions Generales d&apos;Utilisation
          </h1>
          <p className="text-sm text-surface-400 mb-10">Derniere mise a jour : 1er avril 2026</p>

          {/* 1. Objet */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">1. Objet du service</h2>
            <p className="text-surface-600 leading-relaxed">
              Les presentes Conditions Generales d&apos;Utilisation (ci-apres &laquo; CGU &raquo;)
              regissent l&apos;acces et l&apos;utilisation de la plateforme{' '}
              <strong className="text-surface-800">Afrikalytics</strong>, un service SaaS (Software
              as a Service) de Business Intelligence concu pour l&apos;Afrique francophone.
              Afrikalytics est edite par <strong className="text-surface-800">Marketym</strong>, une
              marque de <strong className="text-surface-800">H&amp;C Executive Education</strong>,
              dont le siege social est situe a Dakar, Senegal.
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              La plateforme permet aux utilisateurs d&apos;acceder a des etudes de marche, des
              insights sectoriels, des rapports analytiques et des outils de visualisation de
              donnees adaptes au contexte economique africain.
            </p>
          </section>

          {/* 2. Inscription */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              2. Conditions d&apos;inscription et d&apos;acces
            </h2>
            <p className="text-surface-600 leading-relaxed">
              L&apos;inscription a Afrikalytics est ouverte a toute personne physique ou morale agee
              d&apos;au moins 18 ans ou disposant de la capacite juridique necessaire.
              L&apos;utilisateur s&apos;engage a fournir des informations exactes et a jour lors de
              son inscription, notamment son nom complet et son adresse email.
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              L&apos;acces au service est conditionne a la creation d&apos;un compte et a la
              verification de l&apos;adresse email via un code de verification. L&apos;utilisateur
              est responsable de la confidentialite de ses identifiants de connexion.
            </p>
          </section>

          {/* 3. Plans */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              3. Description des plans et tarification
            </h2>
            <p className="text-surface-600 leading-relaxed mb-4">
              Afrikalytics propose trois niveaux d&apos;abonnement :
            </p>
            <div className="space-y-4">
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-200">
                <h3 className="font-semibold text-surface-800 mb-1">Plan Basic (gratuit)</h3>
                <p className="text-surface-600 text-sm leading-relaxed">
                  Acces limite aux etudes publiques, aux insights de base et au tableau de bord
                  simplifie. Ce plan permet de decouvrir la plateforme sans engagement financier.
                </p>
              </div>
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-200">
                <h3 className="font-semibold text-surface-800 mb-1">Plan Professionnel</h3>
                <p className="text-surface-600 text-sm leading-relaxed">
                  Acces elargi aux etudes premium, insights avances, export de rapports et tableau
                  de bord personnalisable. Tarification mensuelle avec paiement par mobile money
                  (Orange Money, Wave, MTN Money) via PayDunya ou par carte bancaire.
                </p>
              </div>
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-200">
                <h3 className="font-semibold text-surface-800 mb-1">Plan Entreprise</h3>
                <p className="text-surface-600 text-sm leading-relaxed">
                  Acces complet a toutes les fonctionnalites, gestion d&apos;equipe (jusqu&apos;a 5
                  utilisateurs), API dediee, support prioritaire et personnalisation du tableau de
                  bord. Facturation mensuelle ou annuelle.
                </p>
              </div>
            </div>
            <p className="text-surface-600 leading-relaxed mt-4">
              Les tarifs sont exprimes en Francs CFA (XOF). Tout changement de plan prend effet
              immediatement. Les montants deja payes ne sont pas remboursables, sauf disposition
              contraire prevue par la loi applicable.
            </p>
          </section>

          {/* 4. Obligations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              4. Obligations de l&apos;utilisateur
            </h2>
            <p className="text-surface-600 leading-relaxed mb-3">
              L&apos;utilisateur s&apos;engage a :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-600">
              <li>Utiliser la plateforme conformement a sa destination et aux presentes CGU</li>
              <li>
                Ne pas tenter d&apos;acceder de maniere non autorisee aux systemes ou donnees
                d&apos;Afrikalytics
              </li>
              <li>
                Ne pas reproduire, distribuer ou revendre les contenus (etudes, rapports, insights)
                sans autorisation ecrite prealable
              </li>
              <li>
                Ne pas utiliser de robots, scrapers ou tout autre moyen automatise pour extraire des
                donnees de la plateforme
              </li>
              <li>
                Respecter les droits de propriete intellectuelle de tiers lors de l&apos;importation
                de donnees
              </li>
              <li>Signaler immediatement toute utilisation non autorisee de son compte</li>
            </ul>
          </section>

          {/* 5. Propriete intellectuelle */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              5. Propriete intellectuelle
            </h2>
            <p className="text-surface-600 leading-relaxed">
              L&apos;ensemble des elements composant la plateforme Afrikalytics (code source,
              design, logos, marques, etudes, rapports, insights, bases de donnees, algorithmes)
              sont la propriete exclusive de{' '}
              <strong className="text-surface-800">Marketym / H&amp;C Executive Education</strong>{' '}
              ou de ses partenaires et sont proteges par les lois applicables en matiere de
              propriete intellectuelle.
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              L&apos;utilisateur conserve la propriete des donnees qu&apos;il importe sur la
              plateforme. En utilisant le service, l&apos;utilisateur accorde a Afrikalytics une
              licence limitee, non exclusive, pour traiter ces donnees aux seules fins de fourniture
              du service.
            </p>
          </section>

          {/* 6. Protection des donnees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              6. Protection des donnees personnelles
            </h2>
            <p className="text-surface-600 leading-relaxed">
              Afrikalytics s&apos;engage a proteger les donnees personnelles de ses utilisateurs
              conformement aux legislations suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-600 mt-3">
              <li>
                <strong className="text-surface-700">
                  Reglement General sur la Protection des Donnees (RGPD)
                </strong>{' '}
                &mdash; Reglement (UE) 2016/679
              </li>
              <li>
                <strong className="text-surface-700">Loi senegalaise n&deg;2008-12</strong> du 25
                janvier 2008 relative a la protection des donnees a caractere personnel (CDP)
              </li>
              <li>
                <strong className="text-surface-700">Loi ivoirienne n&deg;2013-450</strong> du 19
                juin 2013 relative a la protection des donnees a caractere personnel
              </li>
              <li>
                <strong className="text-surface-700">Loi beninoise n&deg;2009-09</strong> portant
                protection des donnees a caractere personnel en Republique du Benin (APDP)
              </li>
            </ul>
            <p className="text-surface-600 leading-relaxed mt-3">
              Pour plus d&apos;informations sur le traitement de vos donnees, veuillez consulter
              notre{' '}
              <Link
                href="/legal/confidentialite"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Politique de Confidentialite
              </Link>
              .
            </p>
          </section>

          {/* 7. Limitation de responsabilite */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              7. Limitation de responsabilite
            </h2>
            <p className="text-surface-600 leading-relaxed">
              Les etudes, rapports et insights fournis par Afrikalytics sont communiques a titre
              informatif et ne constituent pas des conseils en investissement, des recommandations
              financieres ou des garanties de resultats. L&apos;utilisateur reste seul responsable
              des decisions prises sur la base de ces informations.
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              Afrikalytics s&apos;efforce d&apos;assurer la disponibilite continue de la plateforme,
              mais ne garantit pas un fonctionnement ininterrompu. En cas de force majeure, de
              maintenance programmee ou d&apos;incident technique, Afrikalytics ne saurait etre
              tenue responsable des dommages indirects, pertes de donnees ou manques a gagner subis
              par l&apos;utilisateur.
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              La responsabilite d&apos;Afrikalytics est limitee au montant des sommes effectivement
              versees par l&apos;utilisateur au cours des 12 derniers mois precedant
              l&apos;evenement donnant lieu a responsabilite.
            </p>
          </section>

          {/* 8. Resiliation */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">8. Resiliation</h2>
            <p className="text-surface-600 leading-relaxed">
              L&apos;utilisateur peut resilier son compte a tout moment depuis son espace de profil
              ou en contactant le support. La resiliation entraine la suppression du compte et des
              donnees associees dans un delai de 30 jours, sous reserve des obligations legales de
              conservation.
            </p>
            <p className="text-surface-600 leading-relaxed mt-3">
              Afrikalytics se reserve le droit de suspendre ou de supprimer un compte en cas de
              violation des presentes CGU, d&apos;utilisation frauduleuse ou d&apos;activite
              contraire aux lois en vigueur, apres notification prealable sauf en cas
              d&apos;urgence.
            </p>
          </section>

          {/* 9. Droit applicable */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">
              9. Droit applicable et juridiction competente
            </h2>
            <p className="text-surface-600 leading-relaxed">
              Les presentes CGU sont regies par le{' '}
              <strong className="text-surface-700">droit senegalais</strong>. Tout litige relatif a
              l&apos;interpretation ou a l&apos;execution des presentes sera soumis a la competence
              exclusive des{' '}
              <strong className="text-surface-700">tribunaux de Dakar, Senegal</strong>, apres
              tentative de resolution amiable.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-surface-800 mb-3">10. Contact</h2>
            <p className="text-surface-600 leading-relaxed">
              Pour toute question relative aux presentes Conditions Generales d&apos;Utilisation,
              vous pouvez nous contacter :
            </p>
            <div className="bg-surface-50 rounded-xl p-5 border border-surface-200 mt-4">
              <p className="text-surface-700 font-medium">
                Afrikalytics by Marketym / H&amp;C Executive Education
              </p>
              <p className="text-surface-600 text-sm mt-1">Dakar, Senegal</p>
              <p className="text-surface-600 text-sm mt-1">
                Email :{' '}
                <a
                  href="mailto:contact@afrikalytics.com"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  contact@afrikalytics.com
                </a>
              </p>
            </div>
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
