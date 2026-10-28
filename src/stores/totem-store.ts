import { create } from "zustand";
import { persist } from "zustand/middleware";

type TotemState = {
  eventId: string | null;
  setEventId: (id: string | null) => void;
};

/** Evento selecionado no totem e no estoque (mantido entre visitas). */
export const useTotemStore = create<TotemState>()(
  persist(
    (set) => ({
      eventId: null,
      setEventId: (eventId) => set({ eventId }),
    }),
    { name: "tyl-totem" },
  ),
);
