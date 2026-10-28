"use client";

import { useImperativeHandle, useState, type Ref } from "react";
import type { GameHandle } from "@/hooks/use-game-session";
import type { MachineSound } from "@/hooks/use-machine-sound";
import type { GlyphItem } from "@/lib/machine-types";
import { Glyph } from "./glyph";
import type { MachineColors } from "./theme";

const DURATION = 5.5;
const CARD = 152; // 140px + 12px de espaçamento
type Slide = { items: GlyphItem[]; idx: number; dur: number; off: number };

/** Slider: a faixa de prêmios desliza 5,5s e para com o brinde sorteado sob o marcador central. */
export function SliderGame({
  ref,
  pool,
  pri,
  won,
  sound,
}: {
  ref: Ref<GameHandle>;
  pool: GlyphItem[];
  pri: MachineColors;
  won: boolean;
  sound: MachineSound;
}) {
  const [slide, setSlide] = useState<Slide | null>(null);
  const idle = pool.length ? [...pool, ...pool, ...pool, ...pool].slice(0, 10) : [];
  const s = slide ?? { items: idle, idx: 2, dur: 0, off: 0 };

  useImperativeHandle(ref, () => ({
    run: (result) =>
      new Promise<void>((resolve) => {
        const src = pool.length ? pool : [result.product];
        const items = Array.from({ length: 46 }, () => src[Math.floor(Math.random() * src.length)]);
        items[40] = result.product;
        setSlide({ items, idx: 2, dur: 0, off: 0 });
        setTimeout(() => setSlide({ items, idx: 40, dur: DURATION, off: Math.round((Math.random() - 0.5) * 90) }), 50);
        sound.startTicking();
        setTimeout(resolve, DURATION * 1000 + 200);
      }),
  }));

  return (
    <div className="rounded-[22px] bg-[linear-gradient(180deg,#4a4a4a_0%,#161616_35%,#0d0d0d_65%,#3a3a3a_100%)] p-[3px]">
      <div className="relative h-[212px] overflow-hidden rounded-[19px] bg-[#030303]">
        <div
          className="absolute top-6 left-1/2 flex gap-3"
          style={{
            transform: `translateX(${-(s.idx * CARD + 70 + s.off)}px)`,
            transition: `transform ${s.dur}s cubic-bezier(.1,.75,.15,1)`,
            willChange: "transform",
          }}
        >
          {s.items.map((c, i) => {
            const hit = won && slide !== null && i === s.idx;
            return (
              <div
                key={i}
                className="flex h-[164px] w-[140px] flex-[0_0_140px] flex-col items-center justify-center gap-3 rounded-[14px] bg-[linear-gradient(180deg,#151515,#0b0b0b)]"
                style={{ border: `1px solid ${hit ? pri.c : "#1f1f1f"}`, boxShadow: hit ? `0 0 30px -6px ${pri.c}` : "none" }}
              >
                <Glyph item={c} size={60} fontSize={18} />
                <span className="max-w-[90%] truncate text-[11px] tracking-[0.06em] text-[#d4d4d4] uppercase">{c.name}</span>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#030303_0%,rgba(3,3,3,0)_28%,rgba(3,3,3,0)_72%,#030303_100%)]" />
        <div className="absolute top-0 bottom-0 left-1/2 -ml-[1.5px] w-[3px]" style={{ background: pri.c, boxShadow: `0 0 14px ${pri.c}` }} />
        <div className="absolute top-0 left-1/2 -ml-[11px] size-0 border-x-[11px] border-t-[14px] border-x-transparent" style={{ borderTopColor: pri.c }} />
        <div className="absolute bottom-0 left-1/2 -ml-[11px] size-0 border-x-[11px] border-b-[14px] border-x-transparent" style={{ borderBottomColor: pri.c }} />
      </div>
    </div>
  );
}
