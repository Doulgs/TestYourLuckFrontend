import type { Metadata } from "next";
import { LeadsView } from "@/components/leads/leads-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Leads" };

export default function LeadsPage() {
  return <LeadsView />;
}
