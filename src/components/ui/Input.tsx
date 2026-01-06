"use client";

import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className, ...props }: Props) {
  return (
    <label className="block w-full">
      {label ? <div className="text-xs text-zinc-500 mb-1">{label}</div> : null}
      <input
        className={cn(
          "w-full h-10 px-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none",
          "focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300",
          className
        )}
        {...props}
      />
    </label>
  );
}
