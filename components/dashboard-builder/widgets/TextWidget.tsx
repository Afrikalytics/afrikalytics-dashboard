'use client';

import type { DashboardWidget } from '@/lib/types';

interface TextWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export default function TextWidget({ widget }: TextWidgetProps) {
  const { content, fontSize, align } = widget.config;

  const sizeClass = fontSize === 'lg' ? 'text-lg' : fontSize === 'sm' ? 'text-xs' : 'text-sm';
  const alignClass = ALIGN_CLASS[align ?? 'left'];

  return (
    <div
      className={`h-full w-full flex items-center ${sizeClass} ${alignClass} text-gray-700 leading-relaxed whitespace-pre-wrap`}
    >
      {content || 'Double-cliquez pour ajouter du texte\u2026'}
    </div>
  );
}
