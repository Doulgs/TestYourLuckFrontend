"use client";

import { useEffect, useState } from "react";

/** Contador de 140ms que anima as luzes do gabinete. */
export function useTick(ms = 140) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

export type BulbState = { tick: number; spinning: boolean; won: boolean; lights: boolean; color: string };

/** Estado de cada lâmpada, como no protótipo (alterna branco e cor principal). */
export function bulbOn(i: number, off: number, s: BulbState) {
  const c = i % 2 ? "#f5f5f5" : s.color;
  const on = !s.lights
    ? i % 3 === 0
    : s.spinning
      ? (i + s.tick + off) % 4 < 2
      : s.won
        ? (s.tick + i) % 2 === 0
        : (i + off + Math.floor(s.tick / 3)) % 7 === 0;
  return { background: on ? c : "#262626", boxShadow: on ? `0 0 10px ${c}` : "none" };
}

export function Bulbs({ n, off, state, vertical }: { n: number; off: number; state: BulbState; vertical?: boolean }) {
  return (
    <div className={vertical ? "flex flex-col justify-around py-1.5" : "flex w-full justify-between"}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="size-2 rounded-full" style={bulbOn(i, off, state)} />
      ))}
    </div>
  );
}
