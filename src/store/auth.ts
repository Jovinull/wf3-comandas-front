import { create } from "zustand";
import type { AuthUser } from "@/lib/types";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import { useOperationalStore } from "@/store/operational";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  hydrate: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  refreshMe: () => Promise<AuthUser>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  hydrate: () => {
    const token = storage.getToken();
    const user = storage.getUser();
    set({
      token,
      user,
      isAuthenticated: !!token && !!user,
    });

    // também hidrata seleção operacional
    useOperationalStore.getState().hydrateOperational();
  },

  login: async (email, password) => {
    const res = await api.auth.login(email, password);

    // grava token e user do login
    storage.setAuth(res.user, res.token);

    // requisito: chamar /auth/me após login
    const me = await api.auth.me();

    storage.setUser(me.user);
    set({
      token: res.token,
      user: me.user,
      isAuthenticated: true,
    });

    return me.user;
  },

  refreshMe: async () => {
    const me = await api.auth.me();
    storage.setUser(me.user);
    set({ user: me.user, isAuthenticated: true });
    return me.user;
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch {
      // stateless -> mesmo se falhar, limpa local
    } finally {
      storage.clearAuth();
      set({ user: null, token: null, isAuthenticated: false });

      // também limpa seleção do garçom (requisito)
      useOperationalStore.getState().clearOperationalWaiter();

      const g = globalThis as typeof globalThis & { window?: Window };
      if (g.window) g.window.location.href = "/login";
    }
  },
}));
