"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/stores/auth-store";

const subscribe = (cb: () => void) => useAuthStore.persist.onFinishHydration(cb);

/** true após o zustand restaurar a sessão do localStorage (evita redirecionar antes da hora). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
