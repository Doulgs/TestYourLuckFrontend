"use client";

import { cn } from "@/lib/utils";

/** Interruptor do design (40×22, knob branco, ligado na cor principal). */
export function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative h-[22px] w-10 shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-tyl-pink" : "bg-[#333333]",
        className,
      )}
    >
      <span
        className="absolute top-0.5 size-[18px] rounded-full bg-white transition-[left] duration-150"
        style={{ left: checked ? 20 : 2 }}
      />
    </button>
  );
}
