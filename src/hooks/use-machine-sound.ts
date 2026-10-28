"use client";

import { useCallback, useRef } from "react";

/** Efeitos sonoros sintetizados com Web Audio (mesmos timbres do protótipo). */
export function useMachineSound(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  const beep = useCallback(
    (freq: number, dur: number, type: OscillatorType = "square", vol = 0.04, delay = 0) => {
      if (!enabled) return;
      try {
        ctx.current ??= new AudioContext();
        const ac = ctx.current;
        const t = ac.currentTime + delay;
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g);
        g.connect(ac.destination);
        o.start(t);
        o.stop(t + dur + 0.02);
      } catch {
        // áudio indisponível: segue sem som
      }
    },
    [enabled],
  );

  const stopTicking = useCallback(() => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
  }, []);

  const startTicking = useCallback(() => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = setInterval(() => beep(900 + Math.random() * 400, 0.03, "square", 0.015), 80);
  }, [beep]);

  return {
    beep,
    startTicking,
    stopTicking,
    credits: useCallback(() => [660, 880].forEach((f, k) => beep(f, 0.12, "square", 0.04, k * 0.09)), [beep]),
    lever: useCallback(() => beep(180, 0.15, "sawtooth", 0.05), [beep]),
    reelStop: useCallback(() => beep(140, 0.12, "triangle", 0.12), [beep]),
    board: useCallback(() => beep(440, 0.1, "triangle", 0.06), [beep]),
    flip: useCallback((hit: boolean) => beep(hit ? 990 : 520, 0.08, "square", 0.04), [beep]),
    win: useCallback(() => [523, 659, 784, 1047].forEach((f, k) => beep(f, 0.22, "square", 0.05, k * 0.11)), [beep]),
  };
}
export type MachineSound = ReturnType<typeof useMachineSound>;
