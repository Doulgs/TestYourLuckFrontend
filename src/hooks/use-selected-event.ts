"use client";

import { useEffect } from "react";
import { useResource } from "@/hooks/use-resource";
import type { TylEvent } from "@/lib/types";
import { useTotemStore } from "@/stores/totem-store";

/** Lista de eventos + evento selecionado (persistido), garantindo que a seleção exista. */
export function useSelectedEvent(preferredId?: string | null) {
  const { data: events, loading, reload } = useResource<TylEvent[]>("/events");
  const eventId = useTotemStore((s) => s.eventId);
  const setEventId = useTotemStore((s) => s.setEventId);

  useEffect(() => {
    if (!events) return;
    if (preferredId && events.some((e) => e.id === preferredId)) {
      if (preferredId !== eventId) setEventId(preferredId);
      return;
    }
    if (!eventId || !events.some((e) => e.id === eventId)) {
      const fallback = events.find((e) => e.status === "ATIVO") ?? events[0];
      setEventId(fallback?.id ?? null);
    }
  }, [events, eventId, preferredId, setEventId]);

  const valid = events?.some((e) => e.id === eventId) ? eventId : null;
  return { events: events ?? [], loading, reload, eventId: valid, setEventId };
}
