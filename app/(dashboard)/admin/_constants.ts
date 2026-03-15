// =============================================================================
// Admin shared constants — Categories, Icons, Animation variants
// =============================================================================
// Used by admin/ajouter and admin/modifier pages.

export const CATEGORIES = [
  "RH & Talents",
  "Digital & IA",
  "Finance",
  "Marketing",
  "Technologie",
  "Santé",
  "Éducation",
  "Agriculture",
  "Énergie",
  "Immobilier",
  "Commerce",
  "Logistique",
  "Télécommunications",
  "Banque & Assurance",
  "Industrie",
  "Tourisme",
  "Environnement",
  "Gouvernance",
  "Startups",
  "E-commerce",
  "Transport",
  "Médias",
  "Sport",
  "Culture",
  "Mode & Lifestyle",
  "Alimentation",
  "Sécurité",
  "Juridique",
  "Consulting",
  "Autre",
];

export const ICONS = [
  { value: "users", label: "Utilisateurs" },
  { value: "trending", label: "Tendances" },
  { value: "chart", label: "Graphique" },
  { value: "file", label: "Document" },
  { value: "business", label: "Business" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Santé" },
  { value: "education", label: "Éducation" },
  { value: "global", label: "Global" },
  { value: "energy", label: "Énergie" },
  { value: "building", label: "Immobilier" },
  { value: "cart", label: "Commerce" },
  { value: "mobile", label: "Mobile" },
  { value: "lock", label: "Sécurité" },
  { value: "rocket", label: "Innovation" },
  { value: "plant", label: "Agriculture" },
  { value: "factory", label: "Industrie" },
  { value: "plane", label: "Transport" },
  { value: "code", label: "Tech" },
  { value: "star", label: "Premium" },
  { value: "target", label: "Objectif" },
  { value: "brain", label: "IA" },
  { value: "handshake", label: "Partenariat" },
  { value: "megaphone", label: "Marketing" },
  { value: "clipboard", label: "Sondage" },
  { value: "calendar", label: "Événement" },
  { value: "map", label: "Géographie" },
  { value: "flag", label: "Afrique" },
  { value: "lightbulb", label: "Idée" },
  { value: "pie", label: "Stats" },
];

export const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35 },
  }),
};

export const listVariants = {
  visible: { transition: { staggerChildren: 0.04 } },
};

export const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
