import type { Metadata } from "next";
import { Suspense } from "react";
import { SorteiosView } from "@/components/machine/sorteios-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Sorteios" };

export default function SorteiosPage() {
  return (
    <Suspense>
      <SorteiosView />
    </Suspense>
  );
}
