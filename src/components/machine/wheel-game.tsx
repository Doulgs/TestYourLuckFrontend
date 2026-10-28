"use client";

import Image from "next/image";
import { useImperativeHandle, useMemo, useState, type Ref } from "react";
import type { GameHandle } from "@/hooks/use-game-session";
import type { MachineSound } from "@/hooks/use-machine-sound";
import type { GlyphItem } from "@/lib/machine-types";
import { bulbOn, type BulbState } from "./bulbs";
import { Glyph } from "./glyph";
import type { MachineColors } from "./theme";

const DURATION = 5;

/** 8 a 12 segmentos a partir do pool (repetido quando há menos de 8 brindes). */
export function wheelSegments(pool: GlyphItem[]): GlyphItem[] {
  if (!pool.length) return [];
  let segs = [...pool];
  while (segs.length < 8) segs = segs.concat(pool);
  return segs.slice(0, Math.max(8, Math.min(12, pool.length)));
}

function wheelBackground(segs: GlyphItem[]) {
  const n = segs.length;
  if (!n) return "#111";
  const parts = segs.map((p, i) => {
    const a = (i * 360) / n;
    const b = ((i + 1) * 360) / n;
    const col = i % 2 ? `oklch(0.2 0.04 ${p.hue})` : `oklch(0.27 0.07 ${p.hue})`;
    return `${col} ${a.toFixed(2)}deg ${(b - 0.6).toFixed(2)}deg, #000 ${(b - 0.6).toFixed(2)}deg ${b.toFixed(2)}deg`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

/** Roleta: gira 5 segundos e para com um segmento do brinde sorteado sob o ponteiro. */
export function WheelGame({
  ref,
  pool,
  pri,
  bulbs,
  sound,
  onPlay,
}: {
  ref: Ref<GameHandle>;
  pool: GlyphItem[];
  pri: MachineColors;
  bulbs: BulbState;
  sound: MachineSound;
  onPlay: () => void;
}) {
  const base = useMemo(() => wheelSegments(pool), [pool]);
  const [override, setOverride] = useState<GlyphItem[] | null>(null);
  const [rot, setRot] = useState(0);
  const [dur, setDur] = useState(0);
  const segs = override ?? base;
  const n = segs.length || 1;

  useImperativeHandle(ref, () => ({
    run: (result) =>
      new Promise<void>((resolve) => {
        let current = segs;
        if (!current.some((s) => s.id === result.product.id)) {
          // Garante o brinde sorteado na roda mesmo quando o pool tem mais de 12 itens.
          current = current.map((s, i) => (i === 0 ? result.product : s));
          setOverride(current);
        }
        const count = current.length || 1;
        const idxs = current.map((s, i) => (s.id === result.product.id ? i : -1)).filter((i) => i >= 0);
        const i = idxs[Math.floor(Math.random() * idxs.length)] ?? 0;
        const center = ((i + 0.5) * 360) / count + (Math.random() - 0.5) * (360 / count) * 0.6;
        const start = rot - (rot % 360);
        setDur(DURATION);
        setRot(start + 360 * 6 + (360 - center));
        sound.startTicking();
        setTimeout(resolve, DURATION * 1000 + 150);
      }),
  }));

  return (
    <div className="flex justify-center py-2">
      <div className="relative size-[460px]">
        <div
          className="absolute inset-0 rounded-full border-[6px] border-[#1f1f1f] bg-[#0a0a0a]"
          style={{ boxShadow: `0 0 0 2px ${pri.soft}, 0 0 60px -14px ${pri.glow}` }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 size-0" style={{ transform: `rotate(${i * 15}deg)` }}>
              <div className="absolute -left-1 top-[-220px] size-2 rounded-full" style={bulbOn(i, 0, bulbs)} />
            </div>
          ))}
        </div>
        <div
          className="absolute inset-[26px] overflow-hidden rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,.8)]"
          style={{
            background: wheelBackground(segs),
            transform: `rotate(${rot.toFixed(2)}deg)`,
            transition: `transform ${dur}s cubic-bezier(.12,.8,.15,1)`,
          }}
        >
          {segs.map((g, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 size-0" style={{ transform: `rotate(${(((i + 0.5) * 360) / n).toFixed(2)}deg)` }}>
              <div className="absolute top-[-190px] left-[-40px] flex w-20 flex-col items-center gap-1.5">
                <Glyph item={g} size={46} fontSize={14} />
                <span className="text-center text-[10px] leading-tight tracking-[0.06em] text-[#e5e5e5] uppercase">{g.name}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Girar roleta"
          onClick={onPlay}
          className="absolute top-1/2 left-1/2 -mt-12 -ml-12 flex size-24 cursor-pointer items-center justify-center rounded-full border-[3px] bg-[#0a0a0a]"
          style={{ borderColor: pri.c, boxShadow: `0 0 24px ${pri.glow}` }}
        >
          <Image src="/assets/icon-tyl.png" alt="" width={62} height={62} className="size-[62px] object-contain mix-blend-screen" />
        </button>
        <div
          className="absolute top-1 left-1/2 -ml-4 size-0 border-x-[16px] border-t-[34px] border-x-transparent"
          style={{ borderTopColor: pri.c, filter: `drop-shadow(0 0 8px ${pri.c})` }}
        />
      </div>
    </div>
  );
}
