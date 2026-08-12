"use client";

import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  noPadding?: boolean;
  className?: string;
}

/**
 * Card — Container component with consistent styling.
 *
 * Use `interactive` for clickable cards (adds hover/active states).
 */
export default function Card({
  children,
  interactive = false,
  noPadding = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        ${interactive ? "card-interactive" : "card"}
        ${noPadding ? "!p-0" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
