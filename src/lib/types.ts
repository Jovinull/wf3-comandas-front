export enum UserRole {
  MANAGER = "MANAGER",
  WAITER = "WAITER",
}

/**
 * Tipos JSON seguros para substituir `any` em payloads/respostas da API.
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | { [key: string]: JsonValue }
  | JsonValue[];

export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = {
  ok: false;
  error: { code: string; message: string; details?: JsonValue };
};
export type ApiResponse<T> = ApiOk<T> | ApiFail;

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  restaurantId: string;
  isActive?: boolean;
};

export type LoginData = {
  token: string;
  user: AuthUser;
};

export type MeData = {
  user: AuthUser;
  restaurant: { id: string; name: string; slug: string } | null;
};

export type OperationalWaiter = { id: string; name: string };

export type MenuProduct = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  sortOrder: number | null;
  products: MenuProduct[];
};

export type OverviewRow = {
  table: { id: string; name: string; description: string | null };
  comandaOpen: null | {
    id: string;
    openedAt: string;
    status: string;
    partialTotal: string;
  };
};

export type DayComandaRow = {
  id: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt: string | null;
  table: { id: string; name: string };
  total: string;
};

export type ComandaDetail = {
  comanda: {
    id: string;
    status: "OPEN" | "CLOSED";
    openedAt: string;
    closedAt: string | null;
    totalAmount: string | null;
    table: { id: string; name: string } | null;
  };
  orders: Array<{
    id: string;
    note: string | null;
    createdAt: string;
    operationalWaiter: { id: string; name: string } | null;
    items: Array<{
      id: string;
      productId: string;
      productName: string | null;
      quantity: number;
      unitPriceSnapshot: string;
      subtotal: string;
    }>;
  }>;
};

export type PrintJob = {
  id: string;
  orderId: string;
  status: "PENDING" | "PRINTED";
  payload: JsonValue;
  createdAt: string;
};

export type AdminWaiter = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
};

export type AdminTable = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export type AdminCategory = {
  id: string;
  name: string;
  sortOrder: number | null;
  isActive: boolean;
};

export type AdminProduct = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
};
