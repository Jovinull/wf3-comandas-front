import type {
  LoginData,
  MeData,
  OverviewRow,
  OperationalWaiter,
  MenuCategory,
  DayComandaRow,
  ComandaDetail,
  PrintJob,
  AdminWaiter,
  AdminTable,
  AdminCategory,
  AdminProduct,
} from "@/lib/types";
import { storage } from "@/lib/storage";
import { toast } from "@/store/ui";

const API_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("NEXT_PUBLIC_API_URL não definido.");
}

function headersInitToRecord(init?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init) return out;

  if (init instanceof Headers) {
    init.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  if (Array.isArray(init)) {
    for (const [key, value] of init) {
      out[key] = String(value);
    }
    return out;
  }

  for (const [key, value] of Object.entries(init)) {
    out[key] = String(value);
  }

  return out;
}

function isApiErrorResponse(
  v: unknown
): v is { ok: false; error: { message: string } } {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  if (obj.ok !== false) return false;

  const err = obj.error;
  if (!err || typeof err !== "object") return false;

  const msg = (err as Record<string, unknown>).message;
  return typeof msg === "string" && msg.trim().length > 0;
}

function isApiSuccessResponse<T>(v: unknown): v is { ok: true; data: T } {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return obj.ok === true && "data" in obj;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = storage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...headersInitToRecord(init?.headers),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await res.text();
  let parsed: unknown = null;

  try {
    parsed = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    // 401 -> força logout local (token inválido/expirado)
    if (res.status === 401) {
      storage.clearAuth();
      toast.info("Sessão", "Sua sessão expirou. Faça login novamente.");

      // Sonar: comparar diretamente com undefined
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = "/login";
      }
    }

    const msg = isApiErrorResponse(parsed)
      ? parsed.error.message
      : `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (!parsed) throw new Error("Resposta inválida do servidor.");
  if (isApiErrorResponse(parsed)) throw new Error(parsed.error.message);
  if (!isApiSuccessResponse<T>(parsed))
    throw new Error("Resposta inválida do servidor.");

  return parsed.data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<LoginData>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => apiFetch<MeData>("/api/auth/me"),
    logout: () =>
      apiFetch<{ loggedOut: boolean }>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      }),
  },

  operational: {
    waiters: () => apiFetch<OperationalWaiter[]>("/api/operational/waiters"),
    menu: () => apiFetch<MenuCategory[]>("/api/operational/menu"),
    overview: () => apiFetch<OverviewRow[]>("/api/operational/overview"),
    dayComandas: () =>
      apiFetch<DayComandaRow[]>("/api/operational/day/comandas"),
    comandaDetail: (id: string) =>
      apiFetch<ComandaDetail>(`/api/operational/comandas/${id}`),
    closeComanda: (id: string) =>
      apiFetch<{
        id: string;
        status: string;
        openedAt: string;
        closedAt: string;
        totalAmount: string;
      }>(`/api/operational/comandas/${id}/close`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    createOrder: (
      tableId: string,
      payload: {
        operationalWaiterId: string;
        note?: string;
        items: Array<{ productId: string; quantity: number }>;
      }
    ) =>
      apiFetch<{ comandaId: string; orderId: string }>(
        `/api/operational/tables/${tableId}/orders`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
    printPending: () =>
      apiFetch<PrintJob[]>("/api/operational/print-jobs/pending"),
    printMarkPrinted: (id: string) =>
      apiFetch<{ id: string; status: string }>(
        `/api/operational/print-jobs/${id}/printed`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      ),
  },

  admin: {
    waitersList: () => apiFetch<AdminWaiter[]>("/api/admin/waiters"),
    waitersCreate: (payload: { name: string; isActive?: boolean }) =>
      apiFetch<{ id: string }>("/api/admin/waiters", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    waitersUpdate: (
      id: string,
      payload: { name?: string; isActive?: boolean }
    ) =>
      apiFetch<{ id: string }>(`/api/admin/waiters/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    waitersDelete: (id: string) =>
      apiFetch<{ id: string; deactivated: boolean }>(
        `/api/admin/waiters/${id}`,
        { method: "DELETE" }
      ),

    tablesList: () => apiFetch<AdminTable[]>("/api/admin/tables"),
    tablesCreate: (payload: {
      name: string;
      description?: string;
      isActive?: boolean;
    }) =>
      apiFetch<{ id: string }>("/api/admin/tables", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    tablesUpdate: (
      id: string,
      payload: { name?: string; description?: string; isActive?: boolean }
    ) =>
      apiFetch<{ id: string }>(`/api/admin/tables/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    tablesDelete: (id: string) =>
      apiFetch<{ id: string; deactivated: boolean }>(
        `/api/admin/tables/${id}`,
        { method: "DELETE" }
      ),

    categoriesList: () => apiFetch<AdminCategory[]>("/api/admin/categories"),
    categoriesCreate: (payload: {
      name: string;
      sortOrder?: number;
      isActive?: boolean;
    }) =>
      apiFetch<{ id: string }>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    categoriesUpdate: (
      id: string,
      payload: { name?: string; sortOrder?: number; isActive?: boolean }
    ) =>
      apiFetch<{ id: string }>(`/api/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    categoriesDelete: (id: string) =>
      apiFetch<{ id: string; deactivated: boolean }>(
        `/api/admin/categories/${id}`,
        { method: "DELETE" }
      ),

    productsList: () => apiFetch<AdminProduct[]>("/api/admin/products"),
    productsCreate: (payload: {
      categoryId: string;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
      isActive?: boolean;
    }) =>
      apiFetch<{ id: string }>("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    productsUpdate: (
      id: string,
      payload: {
        categoryId?: string;
        name?: string;
        description?: string;
        price?: number;
        imageUrl?: string;
        isActive?: boolean;
      }
    ) =>
      apiFetch<{ id: string }>(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    productsDelete: (id: string) =>
      apiFetch<{ id: string; deactivated: boolean }>(
        `/api/admin/products/${id}`,
        { method: "DELETE" }
      ),

    metricsSummary: (from: string, to: string) =>
      apiFetch<Record<string, unknown>>(
        `/api/admin/metrics/summary?from=${encodeURIComponent(
          from
        )}&to=${encodeURIComponent(to)}`
      ),
    metricsTopProducts: (from: string, to: string) =>
      apiFetch<Array<Record<string, unknown>>>(
        `/api/admin/metrics/top-products?from=${encodeURIComponent(
          from
        )}&to=${encodeURIComponent(to)}`
      ),
    metricsByHour: (from: string, to: string) =>
      apiFetch<Array<Record<string, unknown>>>(
        `/api/admin/metrics/by-hour?from=${encodeURIComponent(
          from
        )}&to=${encodeURIComponent(to)}`
      ),
    metricsByWaiter: (from: string, to: string) =>
      apiFetch<Array<Record<string, unknown>>>(
        `/api/admin/metrics/by-waiter?from=${encodeURIComponent(
          from
        )}&to=${encodeURIComponent(to)}`
      ),
  },
};
