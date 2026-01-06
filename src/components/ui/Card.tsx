"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-white border border-zinc-100 rounded-2xl shadow-soft", className)}>
      {children}
    </div>
  );
}
