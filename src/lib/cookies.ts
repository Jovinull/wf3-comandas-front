import type { UserRole } from "@/lib/types";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function setAuthCookies(role: UserRole) {
  if (typeof document === "undefined") return;
  setCookie("wf3_auth", "1", 7);
  setCookie("wf3_role", role, 7);
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  deleteCookie("wf3_auth");
  deleteCookie("wf3_role");
}
