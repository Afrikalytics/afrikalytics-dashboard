"use client";

import { forwardRef, useId } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

// =============================================================================
// Select — Design System (Corporate Premium)
// =============================================================================
// Corporate: subtle focus ring, rounded-lg, smooth transitions
// =============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "py-2 text-sm",
  md: "py-2.5 text-sm",
  lg: "py-3 text-base",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, options, placeholder, size = "md", className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-surface-700">
            {label}
            {props.required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : helper ? `${selectId}-helper` : undefined}
            className={`
              w-full rounded-lg border bg-white appearance-none cursor-pointer
              pl-4 pr-10 transition-all duration-150
              focus:outline-none focus:ring-1 focus:ring-offset-0
              ${sizeStyles[size]}
              ${error
                ? "border-danger-300 focus:ring-danger-500 focus:border-danger-500"
                : "border-surface-300 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400"
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-sm text-danger-600" role="alert">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {!error && helper && (
          <p id={`${selectId}-helper`} className="text-xs text-surface-500">{helper}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
