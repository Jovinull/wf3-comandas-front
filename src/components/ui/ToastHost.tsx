"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info";

type ToastItem = Readonly<{
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  ttlMs: number;
}>;

function toastClassByType(type: ToastType): string {
  if (type === "success") return "bg-green-50 border-green-100 text-green-800";
  if (type === "error") return "bg-red-50 border-red-100 text-red-800";
  return "bg-white border-zinc-100 text-zinc-800";
}

export default function ToastHost() {
  const { toasts, removeToast } = useUiStore();

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((t: ToastItem) =>
      setTimeout(() => removeToast(t.id), t.ttlMs)
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div className="fixed z-[60] bottom-20 left-0 right-0 px-4 pointer-events-none">
      <div className="max-w-md mx-auto space-y-2">
        {toasts.map((t: ToastItem) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-2xl shadow-soft border px-4 py-3 text-sm",
              toastClassByType(t.type)
            )}
          >
            <div className="font-semibold">{t.title}</div>
            {t.message ? (
              <div className="text-xs mt-1 opacity-90">{t.message}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
