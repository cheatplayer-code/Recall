import { create } from "zustand";

export type ToastVariant = "error" | "success" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
}

const DURATION: Record<ToastVariant, number> = {
  success: 4000,
  info: 5000,
  error: 8000,
};

/**
 * Tiny, app-wide notification queue. Not "new architecture" — just the client
 * state behind the {@link Toaster}. Use the `toast` helper from anywhere
 * (services, hooks) without needing a React context.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (typeof window !== "undefined") {
      window.setTimeout(
        () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        DURATION[toast.variant],
      );
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative helper so non-component code can raise notifications. */
export const toast = {
  error: (message: string, action?: ToastAction) =>
    useToastStore.getState().push({ message, variant: "error", action }),
  success: (message: string, action?: ToastAction) =>
    useToastStore.getState().push({ message, variant: "success", action }),
  info: (message: string, action?: ToastAction) =>
    useToastStore.getState().push({ message, variant: "info", action }),
};
