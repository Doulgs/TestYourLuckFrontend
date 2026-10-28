"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hydrated) router.replace(token ? "/dashboard" : "/login");
  }, [hydrated, token, router]);

  return null;
}
