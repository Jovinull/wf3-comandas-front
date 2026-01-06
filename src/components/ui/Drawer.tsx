"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";

type DrawerProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}>;

export default function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    const w = globalThis as unknown as Window;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    w.addEventListener("keydown", onKey);
    return () => w.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay (nativo + acessível) */}
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end justify-center">
        <div className="w-full max-w-md bg-white rounded-t-3xl shadow-soft border border-zinc-100">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <div className="font-semibold">{title}</div>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="p-4 max-h-[75vh] overflow-auto">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
