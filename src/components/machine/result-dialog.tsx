"use client";

import { hueColor } from "@/lib/format";
import type { MachineDrawResult } from "@/lib/machine-types";
import { Glyph } from "./glyph";
import type { MachineColors } from "./theme";

/** Modal do ganhador: "Jogar novamente (n)" quando restam créditos, senão "Próximo participante". */
export function ResultDialog({
  result,
  credits,
  winMessage,
  pri,
  onClose,
}: {
  result: MachineDrawResult;
  credits: number;
  winMessage: string;
  pri: MachineColors;
  onClose: () => void;
}) {
  const color = hueColor(result.product.hue);
  const first = (result.participantName.split(" ")[0] ?? "").toUpperCase();
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-5 backdrop-blur-[4px]" role="dialog" aria-modal>
      <div
        className="flex w-full max-w-[400px] flex-col items-center gap-3.5 rounded-3xl border border-input bg-[#111111] px-[26px] py-8 text-center"
        style={{ boxShadow: `0 0 80px -20px ${pri.glow}`, animation: "tyl-fade-in .25s ease-out" }}
      >
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">PARABÉNS, {first}</span>
        <div style={{ filter: `drop-shadow(0 0 20px ${color})` }}>
          <Glyph item={result.product} size={104} border={3} fontSize={30} />
        </div>
        <div className="text-sm text-muted-foreground">Você ganhou</div>
        <div className="text-[26px] font-bold tracking-[-0.01em]">{result.product.name}</div>
        <div className="text-[13px] text-[#8a8a8a]">
          {winMessage} · {result.eventName}
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-2 h-12 w-full cursor-pointer rounded-full text-[15px] font-semibold"
          style={{ background: pri.c, color: pri.on }}
        >
          {credits > 0 ? `Jogar novamente (${credits})` : "Próximo participante"}
        </button>
      </div>
    </div>
  );
}
