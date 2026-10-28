"use client";

import { Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSelectedEvent } from "@/hooks/use-selected-event";
import { MachineStage } from "./machine-stage";
import { useDrawSettings } from "./use-draw-settings";

/** Modo de jogo em tela cheia para o totem (sem sidebar), com o mesmo palco da pré-visualização. */
export function PlayView() {
  const params = useSearchParams();
  const { events, eventId } = useSelectedEvent(params.get("evento"));
  const { settings, update } = useDrawSettings();
  const eventName = events.find((e) => e.id === eventId)?.name ?? "—";

  if (!settings) return <div className="py-16 text-center text-sm text-[#8a8a8a]">Carregando...</div>;

  return (
    <MachineStage
      key={eventId ?? "none"}
      settings={settings}
      eventId={eventId}
      mode="play"
      toolbar={
        <>
          <Link
            href={eventId ? `/sorteios?evento=${eventId}` : "/sorteios"}
            className="flex h-9 items-center rounded-[10px] border border-input bg-black/40 px-3 text-[13px] whitespace-nowrap text-muted-foreground hover:text-foreground"
          >
            ← Configurações
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">{eventName}</span>
            <button
              type="button"
              title="Som"
              onClick={() => update({ sound: !settings.sound })}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-input bg-black/40"
            >
              {settings.sound ? <Volume2 className="size-4 opacity-80" /> : <VolumeX className="size-4 opacity-80" />}
            </button>
          </div>
        </>
      }
    />
  );
}
