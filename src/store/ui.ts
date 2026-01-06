import { create } from "zustand";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  ttlMs: number;
};

type UiState = {
  toasts: ToastItem[];
  pushToast: (t: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (t) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...t, id: `${Date.now()}_${Math.random().toString(16).slice(2)}` },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success(title: string, message?: string) {
    useUiStore
      .getState()
      .pushToast({ type: "success", title, message, ttlMs: 2800 });
  },
  error(title: string, message?: string) {
    useUiStore
      .getState()
      .pushToast({ type: "error", title, message, ttlMs: 3400 });
  },
  info(title: string, message?: string) {
    useUiStore
      .getState()
      .pushToast({ type: "info", title, message, ttlMs: 2800 });
  },
};
