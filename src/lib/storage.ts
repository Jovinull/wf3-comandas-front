import type { AuthUser } from "@/lib/types";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookies";

const TOKEN_KEY = "wf3_token";
const USER_KEY = "wf3_user";

function getLocalStorage(): Storage | null {
  const g = globalThis as typeof globalThis & { localStorage?: Storage };
  return g.localStorage ?? null;
}

export const storage = {
  getToken(): string | null {
    const ls = getLocalStorage();
    if (!ls) return null;
    return ls.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    const ls = getLocalStorage();
    if (!ls) return;
    ls.setItem(TOKEN_KEY, token);
  },

  getUser(): AuthUser | null {
    const ls = getLocalStorage();
    if (!ls) return null;

    const raw = ls.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser): void {
    const ls = getLocalStorage();
    if (!ls) return;
    ls.setItem(USER_KEY, JSON.stringify(user));
  },

  setAuth(user: AuthUser, token: string): void {
    this.setUser(user);
    this.setToken(token);
    setAuthCookies(user.role);
  },

  clearAuth(): void {
    const ls = getLocalStorage();
    if (ls) {
      ls.removeItem(TOKEN_KEY);
      ls.removeItem(USER_KEY);
    }
    clearAuthCookies();
  },
};
