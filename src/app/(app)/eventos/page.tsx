import type { Metadata } from "next";
import { EventsView } from "@/components/events/events-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Eventos" };

export default function EventosPage() {
  return <EventsView />;
}
