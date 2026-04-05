'use client';

import { GripVertical, Trash2, Copy } from 'lucide-react';

interface WidgetWrapperProps {
  id: string;
  title: string;
  isEditing: boolean;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  children: React.ReactNode;
}

export default function WidgetWrapper({
  id,
  title,
  isEditing,
  onDelete,
  onDuplicate,
  children,
}: WidgetWrapperProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col group relative">
      {/* Header with drag handle */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 shrink-0">
        {isEditing && (
          <div className="widget-drag-handle cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <h3 className="text-sm font-semibold text-gray-700 truncate flex-1">{title}</h3>

        {/* Action buttons — visible on hover in edit mode */}
        {isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(id);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
              title="Dupliquer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Widget content */}
      <div className="flex-1 min-h-0 px-4 pb-3">{children}</div>

      {/* Resize indicator */}
      {isEditing && (
        <div className="absolute bottom-1 right-1 w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity">
          <svg viewBox="0 0 12 12" className="text-gray-400">
            <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            <circle cx="5" cy="9" r="1.5" fill="currentColor" />
            <circle cx="9" cy="5" r="1.5" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  );
}
