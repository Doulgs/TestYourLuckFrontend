"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuthStore } from "@/stores/auth-store";

/** Renderiza o painel apenas com sessão; sem token, leva ao login. */
export function SessionGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return <div className="min-h-screen bg-black" />;
  return children;
}
