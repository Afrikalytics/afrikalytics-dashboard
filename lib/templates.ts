// =============================================================================
// Afrikalytics Dashboard — Sectoral Dashboard Templates
// =============================================================================
// 10 industry-specific templates tailored for francophone Africa.
// Each template contains 5-7 widgets with realistic data sources and demo data.
// =============================================================================

import type { DashboardLayout } from './types';

// =============================================================================
// Color palettes per sector
// =============================================================================

const COLORS = {
  retail:   ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1e40af'],
  finance:  ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857'],
  health:   ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#b91c1c'],
  telecom:  ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#6d28d9'],
  agri:     ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#15803d'],
  edu:      ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#0e7490'],
  energy:   ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#b45309'],
  transport:['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#0369a1'],
  realestate:['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#7e22ce'],
  ngo:      ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#be123c'],
};

// =============================================================================
// Templates
// =============================================================================

export const DASHBOARD_TEMPLATES: DashboardLayout[] = [
  // =========================================================================
  // 1. Retail / Commerce de detail
  // =========================================================================
  {
    id: 'template-retail',
    name: 'Commerce de detail',
    description: 'Suivi des ventes, performance des points de vente et analyse des produits pour le secteur retail en Afrique francophone.',
    widgets: [
      {
        id: 'retail-revenue-kpi',
        type: 'kpi',
        title: "Chiffre d'affaires mensuel",
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'currency', unit: 'FCFA', colors: COLORS.retail },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'sum' },
      },
      {
        id: 'retail-basket-stat',
        type: 'stat-card',
        title: 'Panier moyen',
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'currency', unit: 'FCFA', colors: COLORS.retail },
        dataSource: { columns: ['value', 'label', 'trend'], aggregation: 'avg' },
      },
      {
        id: 'retail-sales-bar',
        type: 'bar',
        title: 'Ventes par categorie de produit',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'categorie', yAxisKeys: ['ventes', 'objectif'], showLegend: true, showGrid: true, colors: COLORS.retail },
        dataSource: { columns: ['categorie', 'ventes', 'objectif'], aggregation: 'sum' },
      },
      {
        id: 'retail-trend-line',
        type: 'line',
        title: 'Tendance des ventes (12 mois)',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'mois', yAxisKeys: ['ventes', 'objectif'], showLegend: true, showGrid: true, colors: COLORS.retail },
        dataSource: { columns: ['mois', 'ventes', 'objectif'], aggregation: 'sum' },
      },
      {
        id: 'retail-stores-pie',
        type: 'pie',
        title: 'Repartition par point de vente',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.retail },
        dataSource: { columns: ['name', 'value'], aggregation: 'sum' },
      },
      {
        id: 'retail-top-products-table',
        type: 'table',
        title: 'Top 10 produits',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.retail },
        dataSource: { columns: ['Produit', 'Categorie', 'Quantite', 'CA_FCFA', 'Marge'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'retail',
  },

  // =========================================================================
  // 2. Finance / Banque
  // =========================================================================
  {
    id: 'template-finance',
    name: 'Finance / Banque',
    description: 'Analyse des transactions, portefeuille de credits et suivi des indicateurs bancaires.',
    widgets: [
      {
        id: 'finance-transactions-kpi',
        type: 'kpi',
        title: 'Volume de transactions',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'currency', unit: 'FCFA', colors: COLORS.finance },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'sum' },
      },
      {
        id: 'finance-default-stat',
        type: 'stat-card',
        title: 'Taux de defaut',
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'percent', colors: COLORS.finance },
        dataSource: { columns: ['value', 'label', 'trend'] },
      },
      {
        id: 'finance-deposits-area',
        type: 'area',
        title: 'Evolution des depots/retraits',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'mois', yAxisKeys: ['depots', 'retraits'], showLegend: true, showGrid: true, colors: COLORS.finance },
        dataSource: { columns: ['mois', 'depots', 'retraits'], aggregation: 'sum' },
      },
      {
        id: 'finance-credits-bar',
        type: 'bar',
        title: 'Credits par segment client',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'segment', yAxisKeys: ['encours', 'accorde'], showLegend: true, showGrid: true, colors: COLORS.finance },
        dataSource: { columns: ['segment', 'encours', 'accorde'], aggregation: 'sum' },
      },
      {
        id: 'finance-portfolio-pie',
        type: 'pie',
        title: 'Repartition du portefeuille',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.finance },
        dataSource: { columns: ['name', 'value'], aggregation: 'sum' },
      },
      {
        id: 'finance-transactions-table',
        type: 'table',
        title: 'Dernieres transactions',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.finance },
        dataSource: { columns: ['Date', 'Type', 'Montant_FCFA', 'Client', 'Statut'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'finance',
  },

  // =========================================================================
  // 3. Sante
  // =========================================================================
  {
    id: 'template-health',
    name: 'Sante',
    description: 'Suivi des patients, occupation des lits, stocks medicaux et performance des services de sante.',
    widgets: [
      {
        id: 'health-patients-kpi',
        type: 'kpi',
        title: 'Patients traites ce mois',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'number', colors: COLORS.health },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'count' },
      },
      {
        id: 'health-beds-stat',
        type: 'stat-card',
        title: "Taux d'occupation lits",
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'percent', colors: COLORS.health },
        dataSource: { columns: ['value', 'label', 'trend'] },
      },
      {
        id: 'health-specialties-bar',
        type: 'bar',
        title: 'Consultations par specialite',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'specialite', yAxisKeys: ['consultations', 'capacite'], showLegend: true, showGrid: true, colors: COLORS.health },
        dataSource: { columns: ['specialite', 'consultations', 'capacite'], aggregation: 'sum' },
      },
      {
        id: 'health-admissions-line',
        type: 'line',
        title: 'Tendance admissions (12 mois)',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'mois', yAxisKeys: ['admissions', 'sorties'], showLegend: true, showGrid: true, colors: COLORS.health },
        dataSource: { columns: ['mois', 'admissions', 'sorties'], aggregation: 'count' },
      },
      {
        id: 'health-pathology-pie',
        type: 'pie',
        title: 'Repartition par pathologie',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.health },
        dataSource: { columns: ['name', 'value'], aggregation: 'count' },
      },
      {
        id: 'health-stocks-table',
        type: 'table',
        title: 'Stocks medicaments critiques',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.health },
        dataSource: { columns: ['Medicament', 'Stock_actuel', 'Seuil_alerte', 'Fournisseur', 'Statut'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'sante',
  },

  // =========================================================================
  // 4. Telecommunications
  // =========================================================================
  {
    id: 'template-telecom',
    name: 'Telecommunications',
    description: "Suivi des abonnes, trafic de donnees, revenus par offre et couverture reseau.",
    widgets: [
      {
        id: 'telecom-subscribers-kpi',
        type: 'kpi',
        title: 'Abonnes actifs',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'number', colors: COLORS.telecom },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'count' },
      },
      {
        id: 'telecom-arpu-stat',
        type: 'stat-card',
        title: 'ARPU (revenu moyen/utilisateur)',
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'currency', unit: 'FCFA', colors: COLORS.telecom },
        dataSource: { columns: ['value', 'label', 'trend'], aggregation: 'avg' },
      },
      {
        id: 'telecom-traffic-line',
        type: 'line',
        title: 'Trafic donnees (30 jours)',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'jour', yAxisKeys: ['data_go', 'voix_min'], showLegend: true, showGrid: true, unit: 'Go', colors: COLORS.telecom },
        dataSource: { columns: ['jour', 'data_go', 'voix_min'], aggregation: 'sum' },
      },
      {
        id: 'telecom-revenue-bar',
        type: 'bar',
        title: 'Revenus par offre',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'offre', yAxisKeys: ['revenus', 'objectif'], showLegend: true, showGrid: true, colors: COLORS.telecom },
        dataSource: { columns: ['offre', 'revenus', 'objectif'], aggregation: 'sum' },
      },
      {
        id: 'telecom-market-pie',
        type: 'pie',
        title: 'Parts de marche regionales',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.telecom },
        dataSource: { columns: ['name', 'value'], aggregation: 'sum' },
      },
      {
        id: 'telecom-coverage-table',
        type: 'table',
        title: 'Zones couverture reseau',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.telecom },
        dataSource: { columns: ['Region', 'Population', 'Couverture_pct', 'Type_reseau', 'Antennes'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'telecom',
  },

  // =========================================================================
  // 5. Agriculture
  // =========================================================================
  {
    id: 'template-agriculture',
    name: 'Agriculture',
    description: "Suivi de la production agricole, rendements, precipitations et cooperatives partenaires.",
    widgets: [
      {
        id: 'agri-production-kpi',
        type: 'kpi',
        title: 'Production totale (tonnes)',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'number', unit: 't', colors: COLORS.agri },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'sum' },
      },
      {
        id: 'agri-price-stat',
        type: 'stat-card',
        title: 'Prix moyen marche (FCFA/kg)',
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'currency', unit: 'FCFA/kg', colors: COLORS.agri },
        dataSource: { columns: ['value', 'label', 'trend'], aggregation: 'avg' },
      },
      {
        id: 'agri-yield-bar',
        type: 'bar',
        title: 'Rendement par culture',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'culture', yAxisKeys: ['rendement', 'moyenne_nationale'], showLegend: true, showGrid: true, colors: COLORS.agri },
        dataSource: { columns: ['culture', 'rendement', 'moyenne_nationale'], aggregation: 'avg' },
      },
      {
        id: 'agri-rainfall-area',
        type: 'area',
        title: 'Precipitations vs production',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'mois', yAxisKeys: ['precipitations_mm', 'production_t'], showLegend: true, showGrid: true, colors: COLORS.agri },
        dataSource: { columns: ['mois', 'precipitations_mm', 'production_t'], aggregation: 'sum' },
      },
      {
        id: 'agri-surfaces-pie',
        type: 'pie',
        title: 'Repartition surfaces cultivees',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.agri },
        dataSource: { columns: ['name', 'value'], aggregation: 'sum' },
      },
      {
        id: 'agri-cooperatives-table',
        type: 'table',
        title: 'Cooperatives partenaires',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.agri },
        dataSource: { columns: ['Cooperative', 'Region', 'Membres', 'Production_t', 'Culture_principale'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'agriculture',
  },

  // =========================================================================
  // 6. Education
  // =========================================================================
  {
    id: 'template-education',
    name: 'Education',
    description: "Suivi des effectifs scolaires, taux de reussite, ratio eleves/enseignant et resultats par etablissement.",
    widgets: [
      {
        id: 'edu-success-kpi',
        type: 'kpi',
        title: 'Taux de reussite',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'percent', colors: COLORS.edu },
        dataSource: { columns: ['value', 'target', 'label'] },
      },
      {
        id: 'edu-ratio-stat',
        type: 'stat-card',
        title: 'Ratio eleves/enseignant',
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'number', colors: COLORS.edu },
        dataSource: { columns: ['value', 'label', 'trend'] },
      },
      {
        id: 'edu-enrollment-bar',
        type: 'bar',
        title: 'Effectifs par niveau',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'niveau', yAxisKeys: ['inscrits', 'capacite'], showLegend: true, showGrid: true, colors: COLORS.edu },
        dataSource: { columns: ['niveau', 'inscrits', 'capacite'], aggregation: 'count' },
      },
      {
        id: 'edu-trend-line',
        type: 'line',
        title: 'Evolution inscriptions (5 ans)',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'annee', yAxisKeys: ['inscriptions', 'diplomes'], showLegend: true, showGrid: true, colors: COLORS.edu },
        dataSource: { columns: ['annee', 'inscriptions', 'diplomes'], aggregation: 'count' },
      },
      {
        id: 'edu-gender-pie',
        type: 'pie',
        title: 'Repartition filles/garcons',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.edu },
        dataSource: { columns: ['name', 'value'] },
      },
      {
        id: 'edu-results-table',
        type: 'table',
        title: 'Resultats par etablissement',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.edu },
        dataSource: { columns: ['Etablissement', 'Region', 'Effectif', 'Taux_reussite_pct', 'Moyenne_generale'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'education',
  },

  // =========================================================================
  // 7. Energie
  // =========================================================================
  {
    id: 'template-energy',
    name: 'Energie',
    description: "Suivi de la production et consommation electrique, sources d'energie et taux d'acces.",
    widgets: [
      {
        id: 'energy-production-kpi',
        type: 'kpi',
        title: 'Production (MWh)',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'number', unit: 'MWh', colors: COLORS.energy },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'sum' },
      },
      {
        id: 'energy-access-stat',
        type: 'stat-card',
        title: "Taux d'acces electricite",
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'percent', colors: COLORS.energy },
        dataSource: { columns: ['value', 'label', 'trend'] },
      },
      {
        id: 'energy-consumption-area',
        type: 'area',
        title: 'Consommation electrique (24h)',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'heure', yAxisKeys: ['consommation_mw', 'capacite_mw'], showLegend: true, showGrid: true, colors: COLORS.energy },
        dataSource: { columns: ['heure', 'consommation_mw', 'capacite_mw'], aggregation: 'avg' },
      },
      {
        id: 'energy-sources-bar',
        type: 'bar',
        title: "Sources d'energie",
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'source', yAxisKeys: ['production_mwh', 'capacite_mwh'], showLegend: true, showGrid: true, colors: COLORS.energy },
        dataSource: { columns: ['source', 'production_mwh', 'capacite_mwh'], aggregation: 'sum' },
      },
      {
        id: 'energy-clients-pie',
        type: 'pie',
        title: 'Repartition clients',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.energy },
        dataSource: { columns: ['name', 'value'], aggregation: 'sum' },
      },
      {
        id: 'energy-plants-table',
        type: 'table',
        title: 'Centrales et capacites',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.energy },
        dataSource: { columns: ['Centrale', 'Type', 'Capacite_MW', 'Production_MWh', 'Localisation'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'energie',
  },

  // =========================================================================
  // 8. Transport & Logistique
  // =========================================================================
  {
    id: 'template-transport',
    name: 'Transport & Logistique',
    description: "Suivi des livraisons, volumes de transport, couts par corridor et delais de livraison.",
    widgets: [
      {
        id: 'transport-deliveries-kpi',
        type: 'kpi',
        title: 'Livraisons effectuees',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'number', colors: COLORS.transport },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'count' },
      },
      {
        id: 'transport-delay-stat',
        type: 'stat-card',
        title: 'Delai moyen livraison',
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'number', unit: 'jours', colors: COLORS.transport },
        dataSource: { columns: ['value', 'label', 'trend'], aggregation: 'avg' },
      },
      {
        id: 'transport-volume-line',
        type: 'line',
        title: 'Volume transport (12 mois)',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'mois', yAxisKeys: ['tonnage', 'objectif'], showLegend: true, showGrid: true, colors: COLORS.transport },
        dataSource: { columns: ['mois', 'tonnage', 'objectif'], aggregation: 'sum' },
      },
      {
        id: 'transport-costs-bar',
        type: 'bar',
        title: 'Couts par corridor',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'corridor', yAxisKeys: ['cout_fcfa', 'budget'], showLegend: true, showGrid: true, colors: COLORS.transport },
        dataSource: { columns: ['corridor', 'cout_fcfa', 'budget'], aggregation: 'sum' },
      },
      {
        id: 'transport-modes-pie',
        type: 'pie',
        title: 'Modes de transport',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.transport },
        dataSource: { columns: ['name', 'value'], aggregation: 'sum' },
      },
      {
        id: 'transport-routes-table',
        type: 'table',
        title: 'Itineraires principaux',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.transport },
        dataSource: { columns: ['Itineraire', 'Distance_km', 'Tonnage_mensuel', 'Cout_moyen_FCFA', 'Delai_jours'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'transport',
  },

  // =========================================================================
  // 9. Immobilier
  // =========================================================================
  {
    id: 'template-realestate',
    name: 'Immobilier',
    description: "Suivi des ventes immobilieres, tendances de prix, types de biens et projets en cours.",
    widgets: [
      {
        id: 'realestate-units-kpi',
        type: 'kpi',
        title: 'Unites vendues',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'number', colors: COLORS.realestate },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'count' },
      },
      {
        id: 'realestate-occupancy-stat',
        type: 'stat-card',
        title: "Taux d'occupation",
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'percent', colors: COLORS.realestate },
        dataSource: { columns: ['value', 'label', 'trend'] },
      },
      {
        id: 'realestate-price-bar',
        type: 'bar',
        title: 'Prix moyen par quartier',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'quartier', yAxisKeys: ['prix_moyen', 'prix_median'], showLegend: true, showGrid: true, colors: COLORS.realestate },
        dataSource: { columns: ['quartier', 'prix_moyen', 'prix_median'], aggregation: 'avg' },
      },
      {
        id: 'realestate-trend-line',
        type: 'line',
        title: 'Tendance prix (24 mois)',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'mois', yAxisKeys: ['prix_m2', 'indice_marche'], showLegend: true, showGrid: true, colors: COLORS.realestate },
        dataSource: { columns: ['mois', 'prix_m2', 'indice_marche'], aggregation: 'avg' },
      },
      {
        id: 'realestate-types-pie',
        type: 'pie',
        title: 'Types de biens',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.realestate },
        dataSource: { columns: ['name', 'value'], aggregation: 'count' },
      },
      {
        id: 'realestate-projects-table',
        type: 'table',
        title: 'Projets en cours',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.realestate },
        dataSource: { columns: ['Projet', 'Localisation', 'Unites', 'Prix_moyen_FCFA', 'Avancement_pct'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'immobilier',
  },

  // =========================================================================
  // 10. ONG / Developpement
  // =========================================================================
  {
    id: 'template-ngo',
    name: 'ONG / Developpement',
    description: "Suivi des beneficiaires, budgets par programme, decaissements et taux d'execution.",
    widgets: [
      {
        id: 'ngo-beneficiaries-kpi',
        type: 'kpi',
        title: 'Beneficiaires atteints',
        position: { x: 0, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', format: 'number', colors: COLORS.ngo },
        dataSource: { columns: ['value', 'target', 'label'], aggregation: 'count' },
      },
      {
        id: 'ngo-execution-stat',
        type: 'stat-card',
        title: "Taux d'execution budget",
        position: { x: 3, y: 0, w: 3, h: 1 },
        config: { valueKey: 'value', labelKey: 'label', format: 'percent', colors: COLORS.ngo },
        dataSource: { columns: ['value', 'label', 'trend'] },
      },
      {
        id: 'ngo-budget-bar',
        type: 'bar',
        title: 'Budget par programme',
        position: { x: 6, y: 0, w: 6, h: 2 },
        config: { xAxisKey: 'programme', yAxisKeys: ['budget_fcfa', 'depense_fcfa'], showLegend: true, showGrid: true, colors: COLORS.ngo },
        dataSource: { columns: ['programme', 'budget_fcfa', 'depense_fcfa'], aggregation: 'sum' },
      },
      {
        id: 'ngo-disbursement-area',
        type: 'area',
        title: 'Decaissements (12 mois)',
        position: { x: 0, y: 1, w: 6, h: 2 },
        config: { xAxisKey: 'mois', yAxisKeys: ['decaisse', 'prevu'], showLegend: true, showGrid: true, colors: COLORS.ngo },
        dataSource: { columns: ['mois', 'decaisse', 'prevu'], aggregation: 'sum' },
      },
      {
        id: 'ngo-funding-pie',
        type: 'pie',
        title: 'Sources de financement',
        position: { x: 0, y: 3, w: 4, h: 2 },
        config: { valueKey: 'value', labelKey: 'name', showLegend: true, colors: COLORS.ngo },
        dataSource: { columns: ['name', 'value'], aggregation: 'sum' },
      },
      {
        id: 'ngo-projects-table',
        type: 'table',
        title: 'Projets actifs',
        position: { x: 4, y: 3, w: 8, h: 2 },
        config: { format: 'number', colors: COLORS.ngo },
        dataSource: { columns: ['Projet', 'Zone', 'Beneficiaires', 'Budget_FCFA', 'Execution_pct'] },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 0,
    isTemplate: true,
    templateCategory: 'ong',
  },
];

// =============================================================================
// Template metadata for the selection page
// =============================================================================

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  widgetCount: number;
  /** Lucide icon name */
  icon: string;
  color: string;
}

export const TEMPLATE_INFOS: TemplateInfo[] = DASHBOARD_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description ?? '',
  category: t.templateCategory ?? '',
  widgetCount: t.widgets.length,
  icon: {
    retail: 'ShoppingCart',
    finance: 'Landmark',
    sante: 'HeartPulse',
    telecom: 'Wifi',
    agriculture: 'Sprout',
    education: 'GraduationCap',
    energie: 'Zap',
    transport: 'Truck',
    immobilier: 'Building2',
    ong: 'Heart',
  }[t.templateCategory ?? ''] ?? 'LayoutDashboard',
  color: {
    retail: 'bg-blue-100 text-blue-700',
    finance: 'bg-emerald-100 text-emerald-700',
    sante: 'bg-red-100 text-red-700',
    telecom: 'bg-violet-100 text-violet-700',
    agriculture: 'bg-green-100 text-green-700',
    education: 'bg-cyan-100 text-cyan-700',
    energie: 'bg-amber-100 text-amber-700',
    transport: 'bg-sky-100 text-sky-700',
    immobilier: 'bg-purple-100 text-purple-700',
    ong: 'bg-rose-100 text-rose-700',
  }[t.templateCategory ?? ''] ?? 'bg-gray-100 text-gray-700',
}));

// =============================================================================
// Demo data for template previews
// =============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
export const TEMPLATE_DEMO_DATA: Record<string, Record<string, any[]>> = {
  // --- Retail ---
  'retail-revenue-kpi': { data: [{ value: 28500000, target: 30000000, label: "CA mensuel" }] },
  'retail-basket-stat': { data: [{ value: 15200, label: 'Panier moyen', trend: 8.3 }] },
  'retail-sales-bar': { data: [
    { categorie: 'Alimentaire', ventes: 12500000, objectif: 13000000 },
    { categorie: 'Textile', ventes: 8200000, objectif: 9000000 },
    { categorie: 'Electronique', ventes: 5800000, objectif: 6000000 },
    { categorie: 'Cosmetique', ventes: 4100000, objectif: 4500000 },
    { categorie: 'Maison', ventes: 3200000, objectif: 3500000 },
  ]},
  'retail-trend-line': { data: [
    { mois: 'Jan', ventes: 22000000, objectif: 25000000 },
    { mois: 'Fev', ventes: 24500000, objectif: 25000000 },
    { mois: 'Mar', ventes: 26000000, objectif: 26000000 },
    { mois: 'Avr', ventes: 23000000, objectif: 26000000 },
    { mois: 'Mai', ventes: 27500000, objectif: 27000000 },
    { mois: 'Jun', ventes: 29000000, objectif: 28000000 },
    { mois: 'Jul', ventes: 25000000, objectif: 28000000 },
    { mois: 'Aou', ventes: 24000000, objectif: 28000000 },
    { mois: 'Sep', ventes: 28000000, objectif: 29000000 },
    { mois: 'Oct', ventes: 30000000, objectif: 30000000 },
    { mois: 'Nov', ventes: 32000000, objectif: 30000000 },
    { mois: 'Dec', ventes: 35000000, objectif: 32000000 },
  ]},
  'retail-stores-pie': { data: [
    { name: 'Dakar Plateau', value: 35 },
    { name: 'Almadies', value: 22 },
    { name: 'Mermoz', value: 18 },
    { name: 'Thies', value: 15 },
    { name: 'Saint-Louis', value: 10 },
  ]},
  'retail-top-products-table': { data: [
    { Produit: 'Riz brise parfume', Categorie: 'Alimentaire', Quantite: 4500, CA_FCFA: 6750000, Marge: '18%' },
    { Produit: 'Huile vegetale 5L', Categorie: 'Alimentaire', Quantite: 3200, CA_FCFA: 5120000, Marge: '15%' },
    { Produit: 'Telephone portable', Categorie: 'Electronique', Quantite: 850, CA_FCFA: 4250000, Marge: '22%' },
    { Produit: 'Tissu wax (yard)', Categorie: 'Textile', Quantite: 2800, CA_FCFA: 3920000, Marge: '25%' },
    { Produit: 'Lait en poudre 1kg', Categorie: 'Alimentaire', Quantite: 3100, CA_FCFA: 3720000, Marge: '12%' },
    { Produit: 'Savon de Marseille', Categorie: 'Cosmetique', Quantite: 5200, CA_FCFA: 2600000, Marge: '20%' },
    { Produit: 'Ciment (sac 50kg)', Categorie: 'Maison', Quantite: 600, CA_FCFA: 2400000, Marge: '10%' },
    { Produit: 'Sucre en morceaux', Categorie: 'Alimentaire', Quantite: 2900, CA_FCFA: 2320000, Marge: '14%' },
    { Produit: 'Chaussures cuir', Categorie: 'Textile', Quantite: 420, CA_FCFA: 2100000, Marge: '30%' },
    { Produit: 'The vert (boite)', Categorie: 'Alimentaire', Quantite: 3800, CA_FCFA: 1900000, Marge: '16%' },
  ]},

  // --- Finance ---
  'finance-transactions-kpi': { data: [{ value: 1250000000, target: 1500000000, label: 'Volume transactions' }] },
  'finance-default-stat': { data: [{ value: 3.2, label: 'Taux de defaut', trend: -0.5 }] },
  'finance-deposits-area': { data: [
    { mois: 'Jan', depots: 450000000, retraits: 320000000 },
    { mois: 'Fev', depots: 480000000, retraits: 350000000 },
    { mois: 'Mar', depots: 520000000, retraits: 380000000 },
    { mois: 'Avr', depots: 490000000, retraits: 410000000 },
    { mois: 'Mai', depots: 550000000, retraits: 390000000 },
    { mois: 'Jun', depots: 580000000, retraits: 420000000 },
  ]},
  'finance-credits-bar': { data: [
    { segment: 'PME', encours: 850000000, accorde: 1200000000 },
    { segment: 'Particuliers', encours: 620000000, accorde: 900000000 },
    { segment: 'Grandes entreprises', encours: 1100000000, accorde: 1500000000 },
    { segment: 'Microfinance', encours: 280000000, accorde: 400000000 },
  ]},
  'finance-portfolio-pie': { data: [
    { name: 'Credits immobiliers', value: 35 },
    { name: 'Credits consommation', value: 25 },
    { name: 'Credits entreprises', value: 22 },
    { name: 'Microfinance', value: 12 },
    { name: 'Autres', value: 6 },
  ]},
  'finance-transactions-table': { data: [
    { Date: '2026-03-15', Type: 'Virement', Montant_FCFA: 2500000, Client: 'SARL Touba Import', Statut: 'Valide' },
    { Date: '2026-03-15', Type: 'Retrait', Montant_FCFA: 500000, Client: 'Mme Diop Aminata', Statut: 'Valide' },
    { Date: '2026-03-14', Type: 'Depot', Montant_FCFA: 1800000, Client: 'M. Ndiaye Moussa', Statut: 'Valide' },
    { Date: '2026-03-14', Type: 'Mobile Money', Montant_FCFA: 75000, Client: 'M. Fall Ibrahima', Statut: 'En cours' },
    { Date: '2026-03-13', Type: 'Virement', Montant_FCFA: 5000000, Client: 'SA Dakar Industries', Statut: 'Valide' },
  ]},

  // --- Sante ---
  'health-patients-kpi': { data: [{ value: 4250, target: 5000, label: 'Patients traites' }] },
  'health-beds-stat': { data: [{ value: 78, label: "Taux d'occupation", trend: 3.2 }] },
  'health-specialties-bar': { data: [
    { specialite: 'Medecine generale', consultations: 1200, capacite: 1500 },
    { specialite: 'Pediatrie', consultations: 850, capacite: 1000 },
    { specialite: 'Gynecologie', consultations: 620, capacite: 800 },
    { specialite: 'Chirurgie', consultations: 380, capacite: 500 },
    { specialite: 'Ophtalmologie', consultations: 290, capacite: 400 },
  ]},
  'health-admissions-line': { data: [
    { mois: 'Jan', admissions: 380, sorties: 350 },
    { mois: 'Fev', admissions: 410, sorties: 390 },
    { mois: 'Mar', admissions: 450, sorties: 420 },
    { mois: 'Avr', admissions: 390, sorties: 380 },
    { mois: 'Mai', admissions: 420, sorties: 410 },
    { mois: 'Jun', admissions: 480, sorties: 450 },
    { mois: 'Jul', admissions: 350, sorties: 340 },
    { mois: 'Aou', admissions: 320, sorties: 310 },
    { mois: 'Sep', admissions: 400, sorties: 380 },
    { mois: 'Oct', admissions: 430, sorties: 420 },
    { mois: 'Nov', admissions: 460, sorties: 440 },
    { mois: 'Dec', admissions: 500, sorties: 470 },
  ]},
  'health-pathology-pie': { data: [
    { name: 'Paludisme', value: 32 },
    { name: 'Infections respiratoires', value: 22 },
    { name: 'Diarrhees', value: 15 },
    { name: 'Traumatismes', value: 12 },
    { name: 'Hypertension', value: 10 },
    { name: 'Autres', value: 9 },
  ]},
  'health-stocks-table': { data: [
    { Medicament: 'Paracetamol 500mg', Stock_actuel: 1200, Seuil_alerte: 500, Fournisseur: 'Pharma Dakar', Statut: 'OK' },
    { Medicament: 'Amoxicilline 250mg', Stock_actuel: 350, Seuil_alerte: 400, Fournisseur: 'IDA Foundation', Statut: 'Critique' },
    { Medicament: 'Artemether-Lumefantrine', Stock_actuel: 180, Seuil_alerte: 200, Fournisseur: 'UNICEF Supply', Statut: 'Alerte' },
    { Medicament: 'Serum physiologique', Stock_actuel: 800, Seuil_alerte: 300, Fournisseur: 'Sanofi Afrique', Statut: 'OK' },
    { Medicament: 'Insuline rapide', Stock_actuel: 45, Seuil_alerte: 50, Fournisseur: 'Novo Nordisk', Statut: 'Critique' },
  ]},

  // --- Telecom ---
  'telecom-subscribers-kpi': { data: [{ value: 3850000, target: 4000000, label: 'Abonnes actifs' }] },
  'telecom-arpu-stat': { data: [{ value: 4500, label: 'ARPU mensuel', trend: 5.2 }] },
  'telecom-traffic-line': { data: [
    { jour: '1', data_go: 125000, voix_min: 980000 },
    { jour: '5', data_go: 142000, voix_min: 1020000 },
    { jour: '10', data_go: 138000, voix_min: 950000 },
    { jour: '15', data_go: 155000, voix_min: 1050000 },
    { jour: '20', data_go: 168000, voix_min: 1100000 },
    { jour: '25', data_go: 175000, voix_min: 1080000 },
    { jour: '30', data_go: 182000, voix_min: 1120000 },
  ]},
  'telecom-revenue-bar': { data: [
    { offre: 'Prepaye Voix', revenus: 850000000, objectif: 900000000 },
    { offre: 'Prepaye Data', revenus: 620000000, objectif: 700000000 },
    { offre: 'Postpaye', revenus: 480000000, objectif: 500000000 },
    { offre: 'Mobile Money', revenus: 350000000, objectif: 400000000 },
    { offre: 'Entreprises', revenus: 280000000, objectif: 300000000 },
  ]},
  'telecom-market-pie': { data: [
    { name: 'Dakar', value: 42 },
    { name: 'Thies', value: 15 },
    { name: 'Saint-Louis', value: 12 },
    { name: 'Ziguinchor', value: 10 },
    { name: 'Kaolack', value: 8 },
    { name: 'Autres', value: 13 },
  ]},
  'telecom-coverage-table': { data: [
    { Region: 'Dakar', Population: 3800000, Couverture_pct: '98%', Type_reseau: '4G/5G', Antennes: 1250 },
    { Region: 'Thies', Population: 2100000, Couverture_pct: '92%', Type_reseau: '4G', Antennes: 480 },
    { Region: 'Saint-Louis', Population: 1050000, Couverture_pct: '85%', Type_reseau: '4G', Antennes: 320 },
    { Region: 'Ziguinchor', Population: 680000, Couverture_pct: '72%', Type_reseau: '3G/4G', Antennes: 180 },
    { Region: 'Tambacounda', Population: 850000, Couverture_pct: '58%', Type_reseau: '3G', Antennes: 120 },
  ]},

  // --- Agriculture ---
  'agri-production-kpi': { data: [{ value: 245000, target: 280000, label: 'Production annuelle' }] },
  'agri-price-stat': { data: [{ value: 350, label: 'Prix moyen arachide', trend: 12.0 }] },
  'agri-yield-bar': { data: [
    { culture: 'Arachide', rendement: 1.2, moyenne_nationale: 1.0 },
    { culture: 'Mil', rendement: 0.8, moyenne_nationale: 0.7 },
    { culture: 'Riz', rendement: 4.5, moyenne_nationale: 3.8 },
    { culture: 'Mais', rendement: 2.1, moyenne_nationale: 1.9 },
    { culture: 'Coton', rendement: 1.1, moyenne_nationale: 0.9 },
  ]},
  'agri-rainfall-area': { data: [
    { mois: 'Jan', precipitations_mm: 2, production_t: 5000 },
    { mois: 'Fev', precipitations_mm: 0, production_t: 3000 },
    { mois: 'Mar', precipitations_mm: 0, production_t: 2000 },
    { mois: 'Avr', precipitations_mm: 5, production_t: 4000 },
    { mois: 'Mai', precipitations_mm: 15, production_t: 8000 },
    { mois: 'Jun', precipitations_mm: 80, production_t: 15000 },
    { mois: 'Jul', precipitations_mm: 200, production_t: 35000 },
    { mois: 'Aou', precipitations_mm: 280, production_t: 55000 },
    { mois: 'Sep', precipitations_mm: 220, production_t: 48000 },
    { mois: 'Oct', precipitations_mm: 80, production_t: 38000 },
    { mois: 'Nov', precipitations_mm: 10, production_t: 22000 },
    { mois: 'Dec', precipitations_mm: 3, production_t: 10000 },
  ]},
  'agri-surfaces-pie': { data: [
    { name: 'Arachide', value: 35 },
    { name: 'Mil/Sorgho', value: 28 },
    { name: 'Riz', value: 18 },
    { name: 'Mais', value: 12 },
    { name: 'Coton', value: 7 },
  ]},
  'agri-cooperatives-table': { data: [
    { Cooperative: 'COOP Niayes', Region: 'Thies', Membres: 450, Production_t: 12000, Culture_principale: 'Maraichage' },
    { Cooperative: 'GIE Casamance Vert', Region: 'Ziguinchor', Membres: 320, Production_t: 8500, Culture_principale: 'Riz' },
    { Cooperative: 'Federation Kaolack', Region: 'Kaolack', Membres: 680, Production_t: 25000, Culture_principale: 'Arachide' },
    { Cooperative: 'COOP Delta', Region: 'Saint-Louis', Membres: 280, Production_t: 18000, Culture_principale: 'Riz' },
    { Cooperative: 'GIE Kolda Agri', Region: 'Kolda', Membres: 190, Production_t: 5500, Culture_principale: 'Coton' },
  ]},

  // --- Education ---
  'edu-success-kpi': { data: [{ value: 62.5, target: 75, label: 'Taux de reussite au BAC' }] },
  'edu-ratio-stat': { data: [{ value: 42, label: 'Eleves par enseignant', trend: -2.1 }] },
  'edu-enrollment-bar': { data: [
    { niveau: 'Prescolaire', inscrits: 45000, capacite: 60000 },
    { niveau: 'Primaire', inscrits: 280000, capacite: 300000 },
    { niveau: 'College', inscrits: 180000, capacite: 200000 },
    { niveau: 'Lycee', inscrits: 95000, capacite: 120000 },
    { niveau: 'Universite', inscrits: 42000, capacite: 50000 },
  ]},
  'edu-trend-line': { data: [
    { annee: '2022', inscriptions: 550000, diplomes: 82000 },
    { annee: '2023', inscriptions: 580000, diplomes: 88000 },
    { annee: '2024', inscriptions: 610000, diplomes: 95000 },
    { annee: '2025', inscriptions: 635000, diplomes: 102000 },
    { annee: '2026', inscriptions: 660000, diplomes: 108000 },
  ]},
  'edu-gender-pie': { data: [
    { name: 'Garcons', value: 54 },
    { name: 'Filles', value: 46 },
  ]},
  'edu-results-table': { data: [
    { Etablissement: 'Lycee Lamine Gueye', Region: 'Dakar', Effectif: 2800, Taux_reussite_pct: '78%', Moyenne_generale: 12.4 },
    { Etablissement: 'Lycee Malick Sy', Region: 'Thies', Effectif: 2200, Taux_reussite_pct: '72%', Moyenne_generale: 11.8 },
    { Etablissement: 'Lycee Djignabo', Region: 'Ziguinchor', Effectif: 1800, Taux_reussite_pct: '68%', Moyenne_generale: 11.2 },
    { Etablissement: 'CEM Ousmane Ngom', Region: 'Kaolack', Effectif: 1500, Taux_reussite_pct: '65%', Moyenne_generale: 10.9 },
    { Etablissement: 'Lycee Technique', Region: 'Saint-Louis', Effectif: 1200, Taux_reussite_pct: '70%', Moyenne_generale: 11.5 },
  ]},

  // --- Energie ---
  'energy-production-kpi': { data: [{ value: 1850, target: 2200, label: 'Production mensuelle' }] },
  'energy-access-stat': { data: [{ value: 67, label: "Taux d'acces national", trend: 4.5 }] },
  'energy-consumption-area': { data: [
    { heure: '00h', consommation_mw: 320, capacite_mw: 800 },
    { heure: '04h', consommation_mw: 280, capacite_mw: 800 },
    { heure: '08h', consommation_mw: 520, capacite_mw: 800 },
    { heure: '12h', consommation_mw: 680, capacite_mw: 800 },
    { heure: '14h', consommation_mw: 750, capacite_mw: 800 },
    { heure: '18h', consommation_mw: 700, capacite_mw: 800 },
    { heure: '20h', consommation_mw: 620, capacite_mw: 800 },
    { heure: '22h', consommation_mw: 450, capacite_mw: 800 },
  ]},
  'energy-sources-bar': { data: [
    { source: 'Thermique', production_mwh: 850, capacite_mwh: 1000 },
    { source: 'Solaire', production_mwh: 420, capacite_mwh: 600 },
    { source: 'Hydraulique', production_mwh: 380, capacite_mwh: 500 },
    { source: 'Eolien', production_mwh: 120, capacite_mwh: 200 },
    { source: 'Biomasse', production_mwh: 80, capacite_mwh: 150 },
  ]},
  'energy-clients-pie': { data: [
    { name: 'Residentiel', value: 45 },
    { name: 'Industriel', value: 30 },
    { name: 'Commercial', value: 15 },
    { name: 'Administration', value: 10 },
  ]},
  'energy-plants-table': { data: [
    { Centrale: 'Centrale Cap des Biches', Type: 'Thermique', Capacite_MW: 86, Production_MWh: 520, Localisation: 'Rufisque' },
    { Centrale: 'Parc solaire Diass', Type: 'Solaire', Capacite_MW: 30, Production_MWh: 180, Localisation: 'Diass' },
    { Centrale: 'Barrage Manantali', Type: 'Hydraulique', Capacite_MW: 200, Production_MWh: 380, Localisation: 'Manantali' },
    { Centrale: 'Parc eolien Taiba', Type: 'Eolien', Capacite_MW: 50, Production_MWh: 120, Localisation: 'Taiba Ndiaye' },
    { Centrale: 'Centrale Bel Air', Type: 'Thermique', Capacite_MW: 60, Production_MWh: 330, Localisation: 'Dakar' },
  ]},

  // --- Transport ---
  'transport-deliveries-kpi': { data: [{ value: 12800, target: 15000, label: 'Livraisons du mois' }] },
  'transport-delay-stat': { data: [{ value: 3.5, label: 'Delai moyen', trend: -8.0 }] },
  'transport-volume-line': { data: [
    { mois: 'Jan', tonnage: 45000, objectif: 50000 },
    { mois: 'Fev', tonnage: 48000, objectif: 50000 },
    { mois: 'Mar', tonnage: 52000, objectif: 52000 },
    { mois: 'Avr', tonnage: 49000, objectif: 52000 },
    { mois: 'Mai', tonnage: 55000, objectif: 55000 },
    { mois: 'Jun', tonnage: 58000, objectif: 55000 },
    { mois: 'Jul', tonnage: 42000, objectif: 55000 },
    { mois: 'Aou', tonnage: 38000, objectif: 50000 },
    { mois: 'Sep', tonnage: 51000, objectif: 52000 },
    { mois: 'Oct', tonnage: 54000, objectif: 55000 },
    { mois: 'Nov', tonnage: 57000, objectif: 55000 },
    { mois: 'Dec', tonnage: 60000, objectif: 58000 },
  ]},
  'transport-costs-bar': { data: [
    { corridor: 'Dakar-Bamako', cout_fcfa: 85000000, budget: 90000000 },
    { corridor: 'Dakar-Conakry', cout_fcfa: 65000000, budget: 70000000 },
    { corridor: 'Dakar-Banjul', cout_fcfa: 25000000, budget: 30000000 },
    { corridor: 'Dakar-Nouakchott', cout_fcfa: 45000000, budget: 50000000 },
  ]},
  'transport-modes-pie': { data: [
    { name: 'Route', value: 55 },
    { name: 'Maritime', value: 25 },
    { name: 'Ferroviaire', value: 12 },
    { name: 'Aerien', value: 8 },
  ]},
  'transport-routes-table': { data: [
    { Itineraire: 'Dakar - Bamako', Distance_km: 1250, Tonnage_mensuel: 18000, Cout_moyen_FCFA: 4500000, Delai_jours: 4 },
    { Itineraire: 'Dakar - Conakry', Distance_km: 950, Tonnage_mensuel: 12000, Cout_moyen_FCFA: 3200000, Delai_jours: 3 },
    { Itineraire: 'Dakar - Abidjan', Distance_km: 1800, Tonnage_mensuel: 8500, Cout_moyen_FCFA: 6800000, Delai_jours: 5 },
    { Itineraire: 'Dakar - Banjul', Distance_km: 320, Tonnage_mensuel: 5500, Cout_moyen_FCFA: 1200000, Delai_jours: 1 },
    { Itineraire: 'Dakar - Nouakchott', Distance_km: 580, Tonnage_mensuel: 7200, Cout_moyen_FCFA: 2800000, Delai_jours: 2 },
  ]},

  // --- Immobilier ---
  'realestate-units-kpi': { data: [{ value: 156, target: 200, label: 'Ventes du trimestre' }] },
  'realestate-occupancy-stat': { data: [{ value: 85, label: "Taux d'occupation", trend: 2.3 }] },
  'realestate-price-bar': { data: [
    { quartier: 'Almadies', prix_moyen: 2800000, prix_median: 2500000 },
    { quartier: 'Plateau', prix_moyen: 2200000, prix_median: 2000000 },
    { quartier: 'Mermoz', prix_moyen: 1800000, prix_median: 1600000 },
    { quartier: 'Sacre-Coeur', prix_moyen: 1500000, prix_median: 1400000 },
    { quartier: 'Parcelles', prix_moyen: 800000, prix_median: 750000 },
  ]},
  'realestate-trend-line': { data: [
    { mois: 'Jan 25', prix_m2: 850000, indice_marche: 100 },
    { mois: 'Avr 25', prix_m2: 870000, indice_marche: 102 },
    { mois: 'Jul 25', prix_m2: 890000, indice_marche: 105 },
    { mois: 'Oct 25', prix_m2: 920000, indice_marche: 108 },
    { mois: 'Jan 26', prix_m2: 950000, indice_marche: 112 },
    { mois: 'Mar 26', prix_m2: 980000, indice_marche: 115 },
  ]},
  'realestate-types-pie': { data: [
    { name: 'Appartement', value: 40 },
    { name: 'Villa', value: 25 },
    { name: 'Terrain', value: 20 },
    { name: 'Bureau', value: 10 },
    { name: 'Commercial', value: 5 },
  ]},
  'realestate-projects-table': { data: [
    { Projet: 'Residence Les Almadies', Localisation: 'Almadies', Unites: 120, Prix_moyen_FCFA: 85000000, Avancement_pct: '75%' },
    { Projet: 'Tour Dakar Business', Localisation: 'Plateau', Unites: 80, Prix_moyen_FCFA: 120000000, Avancement_pct: '45%' },
    { Projet: 'Cite Diamniadio', Localisation: 'Diamniadio', Unites: 500, Prix_moyen_FCFA: 25000000, Avancement_pct: '60%' },
    { Projet: 'Villa Saly', Localisation: 'Saly', Unites: 45, Prix_moyen_FCFA: 65000000, Avancement_pct: '90%' },
    { Projet: 'Eco-quartier Lac Rose', Localisation: 'Lac Rose', Unites: 200, Prix_moyen_FCFA: 35000000, Avancement_pct: '30%' },
  ]},

  // --- ONG ---
  'ngo-beneficiaries-kpi': { data: [{ value: 125000, target: 150000, label: 'Beneficiaires 2026' }] },
  'ngo-execution-stat': { data: [{ value: 72, label: "Taux d'execution", trend: 8.5 }] },
  'ngo-budget-bar': { data: [
    { programme: 'Education', budget_fcfa: 850000000, depense_fcfa: 620000000 },
    { programme: 'Sante', budget_fcfa: 720000000, depense_fcfa: 580000000 },
    { programme: 'Eau & Assainissement', budget_fcfa: 480000000, depense_fcfa: 350000000 },
    { programme: 'Agriculture', budget_fcfa: 380000000, depense_fcfa: 290000000 },
    { programme: 'Microfinance', budget_fcfa: 250000000, depense_fcfa: 180000000 },
  ]},
  'ngo-disbursement-area': { data: [
    { mois: 'Jan', decaisse: 180000000, prevu: 200000000 },
    { mois: 'Fev', decaisse: 195000000, prevu: 200000000 },
    { mois: 'Mar', decaisse: 220000000, prevu: 220000000 },
    { mois: 'Avr', decaisse: 205000000, prevu: 230000000 },
    { mois: 'Mai', decaisse: 240000000, prevu: 240000000 },
    { mois: 'Jun', decaisse: 260000000, prevu: 250000000 },
    { mois: 'Jul', decaisse: 230000000, prevu: 260000000 },
    { mois: 'Aou', decaisse: 200000000, prevu: 250000000 },
    { mois: 'Sep', decaisse: 250000000, prevu: 260000000 },
    { mois: 'Oct', decaisse: 270000000, prevu: 270000000 },
    { mois: 'Nov', decaisse: 280000000, prevu: 280000000 },
    { mois: 'Dec', decaisse: 300000000, prevu: 290000000 },
  ]},
  'ngo-funding-pie': { data: [
    { name: 'Bailleurs bilateraux', value: 35 },
    { name: 'ONU / Agences', value: 25 },
    { name: 'Fondations privees', value: 20 },
    { name: 'Etat / Gouvernement', value: 12 },
    { name: 'Autofinancement', value: 8 },
  ]},
  'ngo-projects-table': { data: [
    { Projet: 'Education pour tous', Zone: 'Kolda / Sedhiou', Beneficiaires: 35000, Budget_FCFA: 450000000, Execution_pct: '68%' },
    { Projet: 'Sante maternelle', Zone: 'Tambacounda', Beneficiaires: 22000, Budget_FCFA: 320000000, Execution_pct: '75%' },
    { Projet: 'Acces eau potable', Zone: 'Matam / Kanel', Beneficiaires: 18000, Budget_FCFA: 280000000, Execution_pct: '82%' },
    { Projet: 'Resilience agricole', Zone: 'Kaolack / Fatick', Beneficiaires: 28000, Budget_FCFA: 380000000, Execution_pct: '60%' },
    { Projet: 'Microfinance femmes', Zone: 'Ziguinchor', Beneficiaires: 12000, Budget_FCFA: 150000000, Execution_pct: '90%' },
  ]},
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Returns demo data array for a specific widget ID from the template demo data.
 * Falls back to an empty array if not found.
 */
export function getTemplateDemoData(widgetId: string): Record<string, unknown>[] {
  return TEMPLATE_DEMO_DATA[widgetId]?.data ?? [];
}

/**
 * Returns a template by its ID, or undefined if not found.
 */
export function getTemplateById(id: string): DashboardLayout | undefined {
  return DASHBOARD_TEMPLATES.find((t) => t.id === id);
}
