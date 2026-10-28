import type { Metadata } from "next";
import { WebhooksView } from "@/components/webhooks/webhooks-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Webhooks" };

export default function WebhooksPage() {
  return <WebhooksView />;
}
