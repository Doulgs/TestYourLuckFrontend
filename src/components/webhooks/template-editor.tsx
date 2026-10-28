"use client";

import { useRef, useState } from "react";
import { MentionList, handleMentionKey } from "@/components/webhooks/mention-list";
import { applyMention, detectMention, filterVars, type Mention, type TemplateVar } from "@/components/webhooks/variables";

/** Editor do body: numeração de linhas, fonte mono e autocomplete de variáveis com "@". */
export function TemplateEditor({ value, onChange, vars }: { value: string; onChange: (v: string) => void; vars: TemplateVar[] }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mention, setMention] = useState<Mention | null>(null);
  const lines = value.split("\n").length;
  const items = mention ? filterVars(vars, mention.q) : [];
  const idx = mention ? Math.min(mention.idx, Math.max(0, items.length - 1)) : 0;

  const pick = (k: string) => {
    if (!mention) return;
    const r = applyMention(value, mention, k);
    onChange(r.value);
    setMention(null);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = r.caret;
      }
    });
  };

  return (
    <div className="relative flex rounded-xl border border-input bg-[#050505]">
      <div className="min-w-11 rounded-l-xl border-r border-[#1f1f1f] bg-[#0a0a0a] py-3 text-right font-mono text-[13px] leading-[22px] text-[#5a5a5a] select-none">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="px-2.5">
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value}
        spellCheck={false}
        aria-label="Body"
        onChange={(e) => {
          onChange(e.target.value);
          setMention(detectMention(e.target.value, e.target.selectionStart));
        }}
        onKeyDown={(e) => {
          if (mention) handleMentionKey(e, items.length, idx, (i) => setMention({ ...mention, idx: i }), () => items[idx] && pick(items[idx].k), () => setMention(null));
        }}
        onBlur={() => setTimeout(() => setMention(null), 120)}
        style={{ height: Math.max(320, lines * 22 + 26) }}
        className="min-w-0 flex-1 resize-none overflow-x-auto bg-transparent px-3.5 py-3 font-mono text-[13px] leading-[22px] whitespace-pre text-[#e5e5e5] outline-none"
      />
      {mention && (
        <MentionList
          items={items}
          active={idx}
          onPick={pick}
          style={{ top: 12 + (mention.line + 1) * 22 + 4, left: Math.min(58 + mention.col * 7.8, 600) }}
        />
      )}
    </div>
  );
}
