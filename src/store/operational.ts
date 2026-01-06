import { create } from "zustand";

const KEY_ID = "wf3_operational_waiter_id";
const KEY_NAME = "wf3_operational_waiter_name";

function getLocalStorage(): Storage | null {
  const g = globalThis as typeof globalThis & { localStorage?: Storage };
  return g.localStorage ?? null;
}

function readLS(key: string): string | null {
  const ls = getLocalStorage();
  return ls?.getItem(key) ?? null;
}

function writeLS(key: string, value: string): void {
  const ls = getLocalStorage();
  ls?.setItem(key, value);
}

function removeLS(key: string): void {
  const ls = getLocalStorage();
  ls?.removeItem(key);
}

type OperationalState = {
  operationalWaiterId: string | null;
  operationalWaiterName: string | null;
  hydrateOperational: () => void;
  setOperationalWaiter: (id: string, name: string) => void;
  clearOperationalWaiter: () => void;
};

export const useOperationalStore = create<OperationalState>((set) => ({
  operationalWaiterId: null,
  operationalWaiterName: null,

  hydrateOperational: () => {
    const id = readLS(KEY_ID);
    const name = readLS(KEY_NAME);
    set({
      operationalWaiterId: id,
      operationalWaiterName: name,
    });
  },

  setOperationalWaiter: (id, name) => {
    writeLS(KEY_ID, id);
    writeLS(KEY_NAME, name);
    set({ operationalWaiterId: id, operationalWaiterName: name });
  },

  clearOperationalWaiter: () => {
    removeLS(KEY_ID);
    removeLS(KEY_NAME);
    set({ operationalWaiterId: null, operationalWaiterName: null });
  },
}));
