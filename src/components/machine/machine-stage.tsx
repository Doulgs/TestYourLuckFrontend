"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useGameSession, type GameHandle } from "@/hooks/use-game-session";
import { useMachineSound } from "@/hooks/use-machine-sound";
import { useResource } from "@/hooks/use-resource";
import type { DrawSettings, GlyphItem, MachineField, MachinePool, MachineProduct } from "@/lib/machine-types";
import { MachineCabinet } from "./cabinet";
import { toGlyph } from "./glyph";
import { LeadForm } from "./lead-form";
import { ResultDialog } from "./result-dialog";
import { machineColors, machineZoom, stageBackground } from "./theme";

/** Mede a largura disponível do palco para o ajuste de zoom do gabinete. */
function useWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(800);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
      setHeight(window.innerHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width, height };
}

/**
 * Palco da máquina: usado na pré-visualização interativa (tela de configuração) e no modo de jogo.
 * Deve ser montado com `key={eventId}` para reiniciar a sessão ao trocar de evento.
 */
export function MachineStage({
  settings,
  eventId,
  mode,
  toolbar,
}: {
  settings: DrawSettings;
  eventId: string | null;
  mode: "preview" | "play";
  toolbar: ReactNode;
}) {
  const play = mode === "play";
  const { data: pool, reload: reloadPool } = useResource<MachinePool>(eventId ? `/events/${eventId}/draw-pool` : null);
  const { data: products } = useResource<MachineProduct[]>("/products");
  const { data: fields } = useResource<MachineField[]>("/custom-fields");
  const sound = useMachineSound(settings.sound);
  const gameRef = useRef<GameHandle | null>(null);
  const { ref, width, height } = useWidth();

  const catalogList = useMemo(() => (products ?? []).map(toGlyph), [products]);
  const catalog = useMemo(() => new Map<string, GlyphItem>(catalogList.map((p) => [p.id, p])), [catalogList]);
  const poolItems = useMemo(() => (pool?.items ?? []).map(toGlyph), [pool]);
  const askedFields = useMemo(
    () => (fields ?? []).filter((f) => f.active && settings.customFieldIds.includes(f.id)),
    [fields, settings.customFieldIds],
  );

  const session = useGameSession({
    eventId,
    settings,
    pool: pool ?? null,
    products: products ?? [],
    reloadPool,
    sound,
    gameRef,
  });
  const { stopTicking } = sound;
  useEffect(() => () => stopTicking(), [stopTicking]);

  const pri = machineColors(settings.primaryColor);
  const zoom = machineZoom(settings, width - 32, height, play);

  return (
    <div
      ref={ref}
      className="relative flex min-w-0 flex-col overflow-hidden"
      style={{
        minHeight: play ? "calc(100vh - 56px)" : 640,
        borderRadius: play ? 12 : 16,
        border: play ? "none" : "1px solid #222222",
        background: stageBackground(settings.background, pri.c),
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3.5">{toolbar}</div>
      <div className="flex flex-1 items-center justify-center px-4 pt-2 pb-7">
        <div style={{ zoom }}>
          <MachineCabinet
            settings={settings}
            pri={pri}
            pool={pool ?? null}
            catalog={catalog}
            items={catalogList.length ? catalogList : poolItems}
            poolItems={poolItems}
            session={session}
            sound={sound}
            gameRef={gameRef}
          />
        </div>
      </div>
      {session.formOpen && !session.spinning && (
        <LeadForm settings={settings} fields={askedFields} pri={pri} onSubmit={session.submitLead} onCancel={session.closeForm} />
      )}
      {session.won && session.result && (
        <ResultDialog result={session.result} credits={session.credits} winMessage={settings.winMessage} pri={pri} onClose={session.closeResult} />
      )}
    </div>
  );
}
