import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayView } from "@/components/machine/play-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Sorteio" };

export default function JogarPage() {
  return (
    <Suspense>
      <PlayView />
    </Suspense>
  );
}
