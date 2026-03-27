// =============================================================================
// Datatym AI Design System — Component Exports
// =============================================================================

export { Button } from "./Button";
export { Badge } from "./Badge";
export { Card, CardHeader, StatCard } from "./Card";
export { Input, Textarea } from "./Input";
export { Select } from "./Select";
export { Modal } from "./Modal";
export { Alert } from "./Alert";
export { Avatar } from "./Avatar";
export { Breadcrumb } from "./Breadcrumb";
export { EmptyState } from "./EmptyState";
export { PageTransition } from "./PageTransition";
export { ProgressBar } from "./ProgressBar";
// Chart components — code-split via next/dynamic to avoid loading recharts (~200KB) in main bundle
// Lazy* names are the canonical exports; AreaChartCard etc. are aliases for drop-in compatibility
export {
  LazyAreaChartCard,
  LazyBarChartCard,
  LazyPieChartCard,
  LazyAreaChartCard as AreaChartCard,
  LazyBarChartCard as BarChartCard,
  LazyPieChartCard as PieChartCard,
} from "./ChartLazy";
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  PageSkeleton,
} from "./Skeleton";
