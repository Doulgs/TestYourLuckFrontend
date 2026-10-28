"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { MentionList, handleMentionKey } from "@/components/webhooks/mention-list";
import { applyMention, detectMention, filterVars, type Mention, type TemplateVar } from "@/components/webhooks/variables";
import type { KeyValue } from "@/lib/types";

const inputClass =
  "h-10 w-full min-w-0 rounded-[10px] border border-input bg-[#141414] px-3 font-mono text-[13px] outline-none placeholder:text-[#737373] focus:border-ring";

/** Lista chave/valor (headers ou params) com autocomplete "@" no valor. */
export function KeyValueEditor({ rows, onChange, vars }: { rows: KeyValue[]; onChange: (rows: KeyValue[]) => void; vars: TemplateVar[] }) {
  const [mention, setMention] = useState<(Mention & { row: number }) | null>(null);
  const items = mention ? filterVars(vars, mention.q) : [];
  const idx = mention ? Math.min(mention.idx, Math.max(0, items.length - 1)) : 0;
  const set = (i: number, patch: Partial<KeyValue>) => onChange(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  const pick = (k: string) => {
    if (!mention) return;
    set(mention.row, { v: applyMention(rows[mention.row].v ?? "", mention, k).value });
    setMention(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_40px] gap-2">
          <input className={inputClass} placeholder="Chave" value={r.k} onChange={(e) => set(i, { k: e.target.value })} />
          <div className="relative min-w-0">
            <input
              className={inputClass}
              placeholder="Valor"
              value={r.v}
              onChange={(e) => {
                set(i, { v: e.target.value });
                const m = detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length);
                setMention(m ? { ...m, row: i } : null);
              }}
              onKeyDown={(e) => {
                if (mention?.row === i)
                  handleMentionKey(e, items.length, idx, (n) => setMention({ ...mention, idx: n }), () => items[idx] && pick(items[idx].k), () => setMention(null));
              }}
              onBlur={() => setTimeout(() => setMention(null), 120)}
            />
            {mention?.row === i && <MentionList items={items} active={idx} onPick={pick} style={{ top: 46, left: 0 }} />}
          </div>
          <button
            type="button"
            title="Remover"
            onClick={() => onChange(rows.filter((_, k) => k !== i))}
            className="flex h-10 cursor-pointer items-center justify-center rounded-[10px] border border-input"
          >
            <Trash2 className="size-[15px] opacity-60" />
          </button>
        </div>
      ))}
      {rows.length === 0 && <span className="py-1.5 text-[13px] text-[#737373]">Nenhum item adicionado.</span>}
      <button
        type="button"
        onClick={() => onChange([...rows, { k: "", v: "" }])}
        className="h-[34px] cursor-pointer self-start rounded-[10px] border border-dashed border-[#333333] bg-[#141414] px-3 text-[13px]"
      >
        + Adicionar
      </button>
    </div>
  );
}
