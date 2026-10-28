"use client";

import type { Tile } from "@/hooks/use-game-session";
import type { GlyphItem } from "@/lib/machine-types";
import { Glyph } from "./glyph";
import type { MachineColors } from "./theme";

/** Blocos: 12 blocos fechados; revele até encontrar 3 iguais ao brinde sorteado. */
export function BlocksGame({
  tiles,
  catalog,
  winnerId,
  pri,
  onFlip,
}: {
  tiles: Tile[];
  catalog: Map<string, GlyphItem>;
  winnerId: string | null;
  pri: MachineColors;
  onFlip: (i: number) => void;
}) {
  const slots: (Tile | null)[] = tiles.length ? tiles : Array.from({ length: 12 }, () => null);
  const found = tiles.filter((t) => t.open && t.pid === winnerId).length;
  return (
    <div className="rounded-[22px] bg-[linear-gradient(180deg,#4a4a4a_0%,#161616_35%,#0d0d0d_65%,#3a3a3a_100%)] p-[3px]">
      <div className="grid grid-cols-4 gap-2.5 rounded-[19px] bg-[#030303] p-3.5">
        {slots.map((t, i) => {
          const open = !!t?.open;
          const item = t ? (catalog.get(t.pid) ?? null) : null;
          const hit = open && t?.pid === winnerId && found >= 3;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onFlip(i)}
              className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] transition-[background,border-color] duration-200"
              style={{
                background: open ? "#0d0d0d" : "linear-gradient(180deg,#1c1c1c,#0d0d0d)",
                border: `1px solid ${hit ? pri.c : open ? "#262626" : "#2a2a2a"}`,
                boxShadow: hit ? `0 0 26px -6px ${pri.c}` : "inset 0 1px 0 rgba(255,255,255,.06)",
              }}
            >
              {!open && (
                <span className="font-mono text-[34px] font-semibold" style={{ color: pri.c, textShadow: `0 0 14px ${pri.glow}` }}>
                  ?
                </span>
              )}
              {open && item && (
                <>
                  <Glyph item={item} size={48} fontSize={15} />
                  <span className="max-w-[90%] truncate text-[10px] tracking-[0.06em] text-[#d4d4d4] uppercase">{item.name}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
