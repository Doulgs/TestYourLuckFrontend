"use client";

import type { Ref } from "react";
import type { GameHandle, GameSession } from "@/hooks/use-game-session";
import type { MachineSound } from "@/hooks/use-machine-sound";
import type { DrawSettings, GlyphItem, MachinePool } from "@/lib/machine-types";
import { BlocksGame } from "./blocks-game";
import { Bulbs, useTick, type BulbState } from "./bulbs";
import { Glyph } from "./glyph";
import { SliderGame } from "./slider-game";
import { SlotGame } from "./slot-game";
import { DEFAULT_LOGO, STYLE_BUTTON, STYLE_MESSAGE, type MachineColors } from "./theme";
import { WheelGame } from "./wheel-game";

function statusLine(s: DrawSettings, pool: MachinePool | null, g: GameSession) {
  if (!pool) return "CARREGANDO...";
  if (g.blockMessage && !g.spinning && !g.won) return g.blockMessage.toUpperCase();
  if (!pool.items.length) return "SEM ESTOQUE NESTE EVENTO";
  if (g.spinning) return "BOA SORTE";
  if (g.won) return "TEMOS UM GANHADOR";
  if (s.style === "BLOCKS" && g.boardActive) {
    const found = g.tiles.filter((t) => t.open && t.pid === g.boardWinnerId).length;
    return `ENCONTRE 3 IGUAIS · ${found}/3`;
  }
  if (g.credits <= 0) return "CADASTRE-SE PARA LIBERAR O JOGO";
  return `${g.credits} ${g.credits === 1 ? "CRÉDITO" : "CRÉDITOS"} · ${STYLE_MESSAGE[s.style]}`;
}

function buttonLabel(s: DrawSettings, g: GameSession) {
  if (g.spinning) return "· · ·";
  if (g.credits <= 0 && !(s.style === "BLOCKS" && g.boardActive)) return "CADASTRAR PARA JOGAR";
  if (s.style === "BLOCKS") return g.boardActive ? "REVELE OS BLOCOS" : "INICIAR";
  return STYLE_BUTTON[s.style];
}

function Counter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[14px] border border-[#1f1f1f] bg-[#050505] px-3.5 py-2.5 shadow-[inset_0_2px_8px_#000]">
      <span className="text-[11px] tracking-[0.14em] text-[#8a8a8a]">{label}</span>
      {children}
    </div>
  );
}

/** Gabinete da máquina (720px de largura lógica): cabeçalho, jogo do estilo, indicadores e botão. */
export function MachineCabinet({
  settings,
  pri,
  pool,
  catalog,
  items,
  poolItems,
  session,
  sound,
  gameRef,
}: {
  settings: DrawSettings;
  pri: MachineColors;
  pool: MachinePool | null;
  catalog: Map<string, GlyphItem>;
  items: GlyphItem[];
  poolItems: GlyphItem[];
  session: GameSession;
  sound: MachineSound;
  gameRef: Ref<GameHandle>;
}) {
  const tick = useTick();
  const bulbs: BulbState = { tick, spinning: session.spinning, won: session.won, lights: settings.lights, color: pri.c };
  const logo = settings.logoMode === "CUSTOM" && settings.logoUrl ? settings.logoUrl : DEFAULT_LOGO;
  const play = () => void session.play();

  return (
    <div className="flex w-[720px] flex-col items-center gap-[18px]">
      <div
        className="flex w-[720px] flex-col gap-3.5 rounded-[32px] border border-[#262626] bg-[linear-gradient(180deg,#181818_0%,#0b0b0b_100%)] p-4"
        style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,.07), 0 40px 80px -40px #000, 0 0 0 1px ${pri.soft}` }}
      >
        <div className="flex flex-col items-center gap-2.5 rounded-[22px] border border-border bg-[#050505] px-4 pt-3.5 pb-4">
          <Bulbs n={16} off={0} state={bulbs} />
          <div
            className={logo === DEFAULT_LOGO ? "h-12 w-[360px] mix-blend-screen" : "h-12 w-[360px]"}
            style={{ background: `url("${logo}") center/contain no-repeat` }}
            role="img"
            aria-label="Logo"
          />
          <span className="text-[15px] font-semibold tracking-[0.02em]">{settings.title}</span>
          <div className="flex h-10 w-full max-w-[480px] items-center justify-center overflow-hidden rounded-[10px] border border-[#1f1f1f] bg-[#0a0a0a] px-3 shadow-[inset_0_2px_10px_#000]">
            <span
              className="truncate font-mono text-[13px] font-semibold tracking-[0.22em]"
              style={{ color: pri.c, textShadow: `0 0 10px ${pri.glow}` }}
            >
              {statusLine(settings, pool, session)}
            </span>
          </div>
        </div>

        {settings.style === "SLOT" && (
          <SlotGame ref={gameRef} items={items} pri={pri} bulbs={bulbs} won={session.won} sound={sound} onPull={play} />
        )}
        {settings.style === "WHEEL" && <WheelGame ref={gameRef} pool={poolItems} pri={pri} bulbs={bulbs} sound={sound} onPlay={play} />}
        {settings.style === "SLIDER" && <SliderGame ref={gameRef} pool={poolItems} pri={pri} won={session.won} sound={sound} />}
        {settings.style === "BLOCKS" && (
          <BlocksGame tiles={session.tiles} catalog={catalog} winnerId={session.boardWinnerId} pri={pri} onFlip={(i) => void session.flip(i)} />
        )}

        <div className="grid grid-cols-3 gap-2.5">
          <Counter label="CRÉDITOS">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-[5px]">
                {Array.from({ length: settings.credits }, (_, i) => {
                  const on = i < session.credits;
                  return (
                    <div
                      key={i}
                      className="size-3.5 rounded"
                      style={{ background: on ? pri.c : "#141414", border: `1px solid ${on ? pri.c : "#2a2a2a"}`, boxShadow: on ? `0 0 10px ${pri.c}` : "none" }}
                    />
                  );
                })}
              </div>
              <span
                className="font-mono text-xl font-semibold"
                style={{ color: session.credits > 0 ? pri.c : "#5a5a5a", textShadow: session.credits > 0 ? `0 0 10px ${pri.glow}` : "none" }}
              >
                {session.credits}
              </span>
            </div>
          </Counter>
          <Counter label="BRINDES EM JOGO">
            <span className="text-right font-mono text-xl font-semibold">{pool?.items.length ?? 0}</span>
          </Counter>
          <Counter label="JOGADAS NO EVENTO">
            <span className="text-right font-mono text-xl font-semibold">{pool?.draws ?? 0}</span>
          </Counter>
        </div>

        <button
          type="button"
          onClick={play}
          className="h-16 cursor-pointer rounded-full font-mono text-lg font-semibold tracking-[0.28em]"
          style={{
            border: `1px solid ${pri.c}`,
            background: session.spinning ? "#1a1a1a" : pri.c,
            color: session.spinning ? "#a1a1a1" : pri.on,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,.3), 0 10px 40px -10px ${pri.glow}`,
          }}
        >
          {buttonLabel(settings, session)}
        </button>
        <div className="px-1.5">
          <Bulbs n={16} off={2} state={bulbs} />
        </div>
      </div>

      {settings.showPrizes && (
        <div className="flex max-w-[720px] flex-wrap justify-center gap-2">
          {poolItems.map((c) => (
            <div key={c.id} className="flex h-[34px] items-center gap-2 rounded-full border border-border bg-[rgba(10,10,10,.8)] pr-3 pl-1.5 text-[13px]">
              <Glyph item={c} size={22} border={1.5} fontSize={9} glow={false} />
              {c.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
