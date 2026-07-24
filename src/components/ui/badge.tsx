"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default:
    "bg-[#C9A96E]/15 text-[#7A6543] border border-[#C9A96E]/20",
  secondary: "bg-gray-100 text-gray-600 border border-gray-200",
  destructive:
    "bg-red-50 text-red-600 border border-red-200",
  outline: "bg-transparent text-[#1A1A1A] border border-gray-300",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
