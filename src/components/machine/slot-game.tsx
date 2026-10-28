"use client";

import { useImperativeHandle, useState, type Ref } from "react";
import type { GameHandle } from "@/hooks/use-game-session";
import type { MachineSound } from "@/hooks/use-machine-sound";
import type { GlyphItem } from "@/lib/machine-types";
import { Bulbs, type BulbState } from "./bulbs";
import { Glyph } from "./glyph";
import type { MachineColors } from "./theme";

type Reel = { cells: GlyphItem[]; pos: number; dur: number };

const CELL = 112;
const DURATIONS = [2, 2.6, 3.2];
const PLACEHOLDER: GlyphItem = { id: "?", name: "Brinde", short: "?", hue: 340, imageUrl: null };

const pick = (items: GlyphItem[]) => items[Math.floor(Math.random() * items.length)] ?? PLACEHOLDER;

/** Rolos iniciais determinísticos (sem aleatoriedade no render). */
function initialReels(items: GlyphItem[]): Reel[] {
  const src = items.length ? items : [PLACEHOLDER];
  return [0, 1, 2].map((r) => ({ cells: [0, 1, 2].map((k) => src[(r * 2 + k) % src.length]), pos: 1, dur: 0 }));
}

/** Caça-níquel: 3 rolos que param em sequência (2s, 2,6s, 3,2s) no brinde sorteado. */
export function SlotGame({
  ref,
  items,
  pri,
  bulbs,
  won,
  sound,
  onPull,
}: {
  ref: Ref<GameHandle>;
  items: GlyphItem[];
  pri: MachineColors;
  bulbs: BulbState;
  won: boolean;
  sound: MachineSound;
  onPull: () => void;
}) {
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [lever, setLever] = useState(false);
  const shown = reels ?? initialReels(items);

  useImperativeHandle(ref, () => ({
    run: (result) =>
      new Promise<void>((resolve) => {
        const src = items.length ? items : [PLACEHOLDER];
        const winner: GlyphItem = result.product;
        const strips = shown.map((reel, i) => [
          ...reel.cells.slice(reel.pos - 1, reel.pos + 2),
          ...Array.from({ length: 22 + i * 7 }, () => pick(src)),
          winner,
          pick(src),
        ]);
        setReels(strips.map((cells) => ({ cells, pos: 1, dur: 0 })));
        setLever(true);
        sound.lever();
        setTimeout(() => setReels(strips.map((cells, i) => ({ cells, pos: cells.length - 2, dur: DURATIONS[i] }))), 40);
        setTimeout(() => setLever(false), 350);
        sound.startTicking();
        DURATIONS.forEach((d) => setTimeout(sound.reelStop, 40 + d * 1000));
        setTimeout(resolve, 40 + DURATIONS[2] * 1000 + 150);
      }),
  }));

  return (
    <div className="flex items-stretch gap-3">
      <Bulbs n={5} off={1} state={bulbs} vertical />
      <div className="min-w-0 flex-1 rounded-[22px] bg-[linear-gradient(180deg,#4a4a4a_0%,#161616_35%,#0d0d0d_65%,#3a3a3a_100%)] p-[3px]">
        <div className="relative flex gap-2 rounded-[19px] bg-[#030303] p-2.5">
          {shown.map((r, i) => (
            <div
              key={i}
              className="relative h-[336px] min-w-0 flex-1 overflow-hidden rounded-xl border border-[#1c1c1c] bg-[linear-gradient(90deg,#0a0a0a_0%,#171717_50%,#0a0a0a_100%)]"
            >
              <div
                style={{
                  transform: `translateY(${-(r.pos - 1) * CELL}px)`,
                  transition: `transform ${r.dur}s cubic-bezier(.18,.9,.22,1.03)`,
                  willChange: "transform",
                }}
              >
                {r.cells.map((c, k) => (
                  <div key={k} className="flex flex-col items-center justify-center gap-2" style={{ height: CELL }}>
                    <Glyph item={c} size={56} fontSize={17} />
                    <div className="max-w-[92%] truncate text-[11px] tracking-[0.06em] text-muted-foreground uppercase">{c.name}</div>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#030303_0%,rgba(3,3,3,0)_32%,rgba(3,3,3,0)_68%,#030303_100%)]" />
            </div>
          ))}
          <div
            className="pointer-events-none absolute top-1/2 right-2.5 left-2.5 -mt-px h-0.5"
            style={{ background: pri.c, opacity: won ? 1 : 0.55, boxShadow: `0 0 12px ${pri.c}` }}
          />
          <div
            className="pointer-events-none absolute top-1/2 -left-px -mt-[9px] size-0 border-y-[9px] border-l-[11px] border-y-transparent"
            style={{ borderLeftColor: pri.c }}
          />
          <div
            className="pointer-events-none absolute top-1/2 -right-px -mt-[9px] size-0 border-y-[9px] border-r-[11px] border-y-transparent"
            style={{ borderRightColor: pri.c }}
          />
          <div className="pointer-events-none absolute inset-2.5 rounded-xl bg-[linear-gradient(180deg,rgba(255,255,255,.07)_0%,rgba(255,255,255,0)_22%)]" />
        </div>
      </div>
      <Bulbs n={5} off={3} state={bulbs} vertical />
      <button type="button" onClick={onPull} title="Puxar alavanca" className="relative flex w-[34px] flex-[0_0_34px] cursor-pointer justify-center">
        <div className="absolute top-6 bottom-6 w-2 rounded bg-[linear-gradient(90deg,#2a2a2a,#5a5a5a,#2a2a2a)]" />
        <div className="absolute bottom-2.5 h-[18px] w-[30px] rounded-md border border-input bg-[#1a1a1a]" />
        <div
          className="absolute size-[30px] rounded-full transition-[top] duration-[280ms] ease-[cubic-bezier(.3,1.4,.5,1)]"
          style={{
            top: lever ? 150 : 8,
            background: pri.c,
            boxShadow: `inset -4px -6px 10px rgba(0,0,0,.35), inset 4px 4px 8px rgba(255,255,255,.35), 0 0 18px ${pri.glow}`,
          }}
        />
      </button>
    </div>
  );
}
