"use client";

import { forwardRef, useState, useId } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

// =============================================================================
// Input — Design System (Corporate Premium)
// =============================================================================
// Supports: label, icon, error message, helper text, password toggle
// Corporate: subtle focus ring, rounded-lg, smooth transitions
// =============================================================================

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "py-2 text-sm",
  md: "py-2.5 text-sm",
  lg: "py-3 text-base",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, icon, size = "md", type, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-700"
          >
            {label}
            {props.required && (
              <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? errorId : helper ? helperId : undefined
            }
            className={`
              w-full rounded-lg border bg-white
              transition-all duration-150
              placeholder:text-surface-400
              focus:outline-none focus:ring-1 focus:ring-offset-0
              ${sizeStyles[size]}
              ${icon ? "pl-10" : "pl-4"}
              ${isPassword ? "pr-12" : "pr-4"}
              ${error
                ? "border-danger-300 focus:ring-danger-500 focus:border-danger-500"
                : "border-surface-300 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400"
              }
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1 rounded-lg"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-sm text-danger-600" role="alert">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {!error && helper && (
          <p id={helperId} className="text-xs text-surface-500">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// =============================================================================
// Textarea — Design System (Corporate Premium)
// =============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-surface-700">
            {label}
            {props.required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full rounded-lg border bg-white px-4 py-3 text-sm
            transition-all duration-150
            placeholder:text-surface-400
            focus:outline-none focus:ring-1 focus:ring-offset-0
            resize-y min-h-[100px]
            ${error
              ? "border-danger-300 focus:ring-danger-500 focus:border-danger-500"
              : "border-surface-300 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400"
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-sm text-danger-600" role="alert">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {!error && helper && (
          <p className="text-xs text-surface-500">{helper}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
