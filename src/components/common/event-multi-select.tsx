"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import type { TylEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

function Option({ on, label, bold, onClick }: { on: boolean; label: string; bold?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm hover:bg-[#1f1f1f]"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border",
          on ? "border-tyl-pink bg-tyl-pink" : "border-[#525252] bg-transparent",
        )}
      >
        {on && <Check className="size-3 text-white" />}
      </span>
      <span className={bold ? "font-semibold" : undefined}>{label}</span>
    </button>
  );
}

/** Seleção de eventos com chips e a opção "Todos os eventos" (marca/desmarca todos). */
export function EventMultiSelect({
  events,
  value,
  onChange,
}: {
  events: Pick<TylEvent, "id" | "name">[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const all = events.map((e) => e.id);
  const allOn = all.length > 0 && all.every((id) => value.includes(id));
  const chips = allOn ? ["Todos os eventos"] : events.filter((e) => value.includes(e.id)).map((e) => e.name);

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="flex min-h-10 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-[10px] border border-input bg-[#141414] px-2.5 py-[5px] text-left outline-none data-[state=open]:border-[#525252]"
        >
          {chips.length === 0 && <span className="text-sm text-[#737373]">Selecione eventos</span>}
          {chips.map((c) => (
            <span key={c} className="flex h-6 items-center rounded-md bg-[#2b1528] px-2 text-xs whitespace-nowrap">
              {c}
            </span>
          ))}
          <ChevronsUpDown className="ml-auto size-3.5 opacity-60" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-[60] max-h-[260px] w-(--radix-popover-trigger-width) min-w-[220px] overflow-y-auto rounded-xl border border-input bg-[#141414] p-1.5 shadow-[0_20px_40px_-10px_#000]"
        >
          <Option on={allOn} bold label="Todos os eventos" onClick={() => onChange(allOn ? [] : all)} />
          {events.map((e) => {
            const on = value.includes(e.id);
            return (
              <Option
                key={e.id}
                on={on}
                label={e.name}
                onClick={() => onChange(on ? value.filter((x) => x !== e.id) : [...value, e.id])}
              />
            );
          })}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
