"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";

type ModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  locked?: boolean;
}>;

export default function Modal({ open, onClose, title, children, locked }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const w = globalThis as unknown as Window;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !locked) onClose();
    }

    w.addEventListener("keydown", onKey);
    return () => w.removeEventListener("keydown", onKey);
  }, [open, onClose, locked]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay (nativo + acessível) */}
      <button
        type="button"
        aria-label={locked ? "Modal bloqueado" : "Fechar"}
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!locked) onClose();
        }}
        disabled={Boolean(locked)}
      />

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-zinc-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <div className="font-semibold">{title}</div>

            {locked ? null : (
              <Button variant="ghost" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>

          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
