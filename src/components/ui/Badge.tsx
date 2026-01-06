"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "muted";

type BadgeProps = Readonly<{
  children: ReactNode;
  variant?: BadgeVariant;
}>;

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border",
        variant === "default"
          ? "bg-zinc-900 text-white border-zinc-900"
          : "bg-zinc-50 text-zinc-600 border-zinc-200"
      )}
    >
      {children}
    </span>
  );
}
