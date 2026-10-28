"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

/** Select shadcn com o visual dos campos do design. */
export function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  size = "modal",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  size?: "modal" | "toolbar" | "compact";
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "w-full rounded-[10px] border-input px-3 text-sm",
          size === "modal" && "h-10! bg-[#0f0f0f] dark:bg-[#0f0f0f]",
          size === "toolbar" && "h-[38px]! bg-[#141414] dark:bg-[#141414]",
          size === "compact" && "h-9! bg-[#141414] text-[13px] dark:bg-[#141414]",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border border-input bg-[#141414] ring-0">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
