"use client";

import { token, type TemplateVar } from "@/components/webhooks/variables";

/** Lista de variáveis do autocomplete "@". Usa onMouseDown para não perder o foco do campo. */
export function MentionList({
  items,
  active,
  onPick,
  style,
}: {
  items: TemplateVar[];
  active: number;
  onPick: (k: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className="absolute z-10 max-h-[260px] w-[280px] overflow-y-auto rounded-xl border border-input bg-[#141414] p-1.5 shadow-[0_20px_40px_-10px_#000]"
    >
      {items.map((m, i) => (
        <div
          key={m.k}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(m.k);
          }}
          className="flex cursor-pointer flex-col gap-0.5 rounded-lg px-2.5 py-[7px] hover:bg-[#1f1f1f]"
          style={{ background: i === active ? "#1f1f1f" : undefined }}
        >
          <span className="text-[13px]">
            {m.label} <span className="text-[11px] text-[#737373]">· {m.group}</span>
          </span>
          <span className="font-mono text-[11px] text-tyl-pink">{token(m.k)}</span>
        </div>
      ))}
      {items.length === 0 && <div className="px-2.5 py-2 text-[13px] text-[#737373]">Nenhuma variável encontrada</div>}
    </div>
  );
}

/** Navegação por teclado comum aos campos com autocomplete. Retorna true se tratou a tecla. */
export function handleMentionKey(
  e: React.KeyboardEvent,
  count: number,
  idx: number,
  setIdx: (i: number) => void,
  pick: () => void,
  close: () => void,
): boolean {
  if (e.key === "ArrowDown") setIdx(Math.min(count - 1, idx + 1));
  else if (e.key === "ArrowUp") setIdx(Math.max(0, idx - 1));
  else if ((e.key === "Enter" || e.key === "Tab") && count > 0) pick();
  else if (e.key === "Escape") close();
  else return false;
  e.preventDefault();
  return true;
}
