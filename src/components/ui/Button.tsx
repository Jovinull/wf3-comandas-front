"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "danger";

type Props = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    full?: boolean;
    ariaLabel?: string;
  }
>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
};

export default function Button({
  variant = "primary",
  full,
  className,
  ariaLabel,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 h-10 text-sm font-medium transition " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = VARIANT_CLASSES[variant];

  return (
    <button
      aria-label={ariaLabel}
      className={cn(base, styles, full ? "w-full" : "", className)}
      {...props}
    />
  );
}
