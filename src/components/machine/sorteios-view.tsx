"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useResource } from "@/hooks/use-resource";
import { useSelectedEvent } from "@/hooks/use-selected-event";
import { useViewportWidth } from "@/hooks/use-viewport";
import type { MachineField } from "@/lib/machine-types";
import { MachineStage } from "./machine-stage";
import { SettingsPanel } from "./settings-panel";
import { useDrawSettings } from "./use-draw-settings";

/** Tela de configuração de sorteios com pré-visualização interativa. */
export function SorteiosView() {
  const params = useSearchParams();
  const width = useViewportWidth();
  const { events, eventId, setEventId } = useSelectedEvent(params.get("evento"));
  const { settings, saving, update } = useDrawSettings();
  const { data: fields } = useResource<MachineField[]>("/custom-fields");
  const wide = width >= 1280;

  if (!settings) return <div className="py-16 text-center text-sm text-[#8a8a8a]">Carregando...</div>;

  return (
    <div className="grid flex-1 items-start gap-5" style={{ gridTemplateColumns: wide ? "420px minmax(0,1fr)" : "minmax(0,1fr)" }}>
      <SettingsPanel
        settings={settings}
        update={update}
        events={events}
        eventId={eventId}
        onEventChange={setEventId}
        fields={fields ?? []}
        saving={saving}
      />
      <div className={wide ? "sticky top-5" : undefined}>
        <MachineStage
          key={eventId ?? "none"}
          settings={settings}
          eventId={eventId}
          mode="preview"
          toolbar={
            <>
              <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <span className="size-2 rounded-full bg-[oklch(0.75_0.17_150)]" />
                Pré-visualização interativa
              </span>
              <Link
                href={eventId ? `/sorteios/jogar?evento=${eventId}` : "/sorteios/jogar"}
                className="flex h-[38px] items-center gap-2 rounded-[10px] bg-tyl-pink px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-tyl-pink-hover"
              >
                <Play className="size-[15px]" /> Abrir sorteio
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}
