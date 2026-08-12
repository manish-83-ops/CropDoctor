"use client";

import type { ReactNode } from "react";
import { STATUS_COLORS, type StatusColor } from "@/lib/constants";
import {
  CircleCheck,
  AlertTriangle,
  CircleAlert,
  CircleHelp,
} from "lucide-react";

interface BadgeProps {
  status: StatusColor;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusIcons: Record<StatusColor, ReactNode> = {
  green: <CircleCheck className="w-4 h-4" />,
  yellow: <AlertTriangle className="w-4 h-4" />,
  red: <CircleAlert className="w-4 h-4" />,
  unknown: <CircleHelp className="w-4 h-4" />,
};

const sizeClasses = {
  sm: "text-xs px-2 py-1",
  md: "text-farmer-xs px-3 py-1.5",
  lg: "text-farmer-base px-4 py-2",
};

/**
 * Badge — Color-coded status indicator.
 *
 * The primary visual language of CropDoctor.
 * Green = healthy, Yellow = caution, Red = danger, Purple = unknown.
 * Always shows icon + text together — understandable even without reading.
 */
export default function Badge({
  status,
  children,
  size = "md",
  showIcon = true,
  className = "",
}: BadgeProps) {
  const colors = STATUS_COLORS[status];

  return (
    <span
      className={`
        ${colors.badge}
        ${size !== "md" ? sizeClasses[size] : ""}
        ${className}
      `}
    >
      {showIcon && statusIcons[status]}
      {children}
    </span>
  );
}
