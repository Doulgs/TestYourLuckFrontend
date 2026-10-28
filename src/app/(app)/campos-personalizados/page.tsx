import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomFieldsView } from "@/components/custom-fields/custom-fields-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Campos personalizados" };

export default function CamposPersonalizadosPage() {
  return (
    <Suspense>
      <CustomFieldsView />
    </Suspense>
  );
}
