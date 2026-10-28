"use client";

import { Ellipsis, type LucideIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type RowMenuItem = { label: string; icon: LucideIcon; onSelect: () => void; danger?: boolean };

/** Botão "…" da última coluna das tabelas, abrindo o menu de ações da linha. */
export function RowMenu({ items }: { items: RowMenuItem[] }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Ações"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-input outline-none hover:bg-[#1c1c1c] data-[state=open]:bg-[#1c1c1c]"
          >
            <Ellipsis className="size-4 opacity-80" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] rounded-xl border border-input bg-[#141414] p-1.5 shadow-[0_20px_40px_-10px_#000] ring-0">
          {items.map(({ label, icon: Icon, onSelect, danger }) => (
            <DropdownMenuItem
              key={label}
              onSelect={onSelect}
              className="h-[38px] gap-2.5 rounded-lg px-2.5 text-sm"
              style={danger ? { color: "oklch(0.75 0.15 25)" } : undefined}
            >
              <Icon className="size-4" style={danger ? { color: "oklch(0.75 0.15 25)" } : undefined} />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
