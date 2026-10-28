import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardView />;
}
