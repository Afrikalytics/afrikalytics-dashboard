"use client";

import Image from "next/image";

// =============================================================================
// Avatar — Design System (Corporate Premium)
// =============================================================================
// Displays user initials or image with status indicator
// Corporate: fine white border ring
// =============================================================================

type AvatarSize = "sm" | "md" | "lg" | "xl";

const avatarPixelSize: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

interface AvatarProps {
  name?: string;
  src?: string;
  size?: AvatarSize;
  status?: "online" | "offline";
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  sm: { container: "h-8 w-8", text: "text-xs", status: "h-2 w-2 ring-1" },
  md: { container: "h-10 w-10", text: "text-sm", status: "h-2.5 w-2.5 ring-2" },
  lg: { container: "h-12 w-12", text: "text-base", status: "h-3 w-3 ring-2" },
  xl: { container: "h-16 w-16", text: "text-lg", status: "h-3.5 w-3.5 ring-2" },
};

const bgColors = [
  "bg-primary-100 text-primary-700",
  "bg-accent-100 text-accent-700",
  "bg-success-100 text-success-700",
  "bg-warning-100 text-warning-700",
  "bg-danger-100 text-danger-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % bgColors.length;
}

export function Avatar({ name = "", src, size = "md", status, className = "" }: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = getInitials(name || "?");
  const colorClass = bgColors[getColorIndex(name)];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={avatarPixelSize[size]}
          height={avatarPixelSize[size]}
          className={`${styles.container} rounded-full object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <div
          className={`
            ${styles.container} ${colorClass}
            rounded-full flex items-center justify-center
            font-semibold ${styles.text}
            ring-2 ring-white shadow-sm
          `}
          aria-label={name}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full ring-white
            ${styles.status}
            ${status === "online" ? "bg-success-500" : "bg-surface-300"}
          `}
          aria-label={status === "online" ? "En ligne" : "Hors ligne"}
        />
      )}
    </div>
  );
}
