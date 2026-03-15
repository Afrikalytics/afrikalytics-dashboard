"use client";

import dynamic from "next/dynamic";

// =============================================================================
// ChartLazy — Code-split wrappers for Chart components
// =============================================================================
// Recharts is ~200KB gzipped. These dynamic imports ensure the library is only
// loaded when a chart is actually rendered on screen.
// Usage: import { LazyAreaChartCard } from "@/components/ui/ChartLazy"
// =============================================================================

const ChartSkeleton = ({ height = 320 }: { height?: number }) => (
  <div
    className="bg-white rounded-xl border border-surface-200 p-6 animate-pulse"
    style={{ height: height + 80 }}
  >
    <div className="skeleton h-5 w-48 rounded mb-2" />
    <div className="skeleton h-3 w-32 rounded mb-6" />
    <div className="skeleton w-full rounded-lg" style={{ height }} />
  </div>
);

export const LazyAreaChartCard = dynamic(
  () => import("./Chart").then((mod) => ({ default: mod.AreaChartCard })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export const LazyBarChartCard = dynamic(
  () => import("./Chart").then((mod) => ({ default: mod.BarChartCard })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export const LazyPieChartCard = dynamic(
  () => import("./Chart").then((mod) => ({ default: mod.PieChartCard })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);
