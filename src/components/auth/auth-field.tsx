import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthField({
  label,
  error,
  aside,
  ...props
}: ComponentProps<typeof Input> & { label: string; error?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </label>
        {aside}
      </div>
      <Input
        {...props}
        aria-invalid={!!error}
        className={cn(
          "h-11 rounded-[10px] border-[#333333] bg-[rgba(20,14,20,.72)] px-3.5 text-sm backdrop-blur-[6px] dark:bg-[rgba(20,14,20,.72)]",
          props.className,
        )}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export const authPrimaryClass =
  "h-11 w-full rounded-[10px] text-sm font-semibold shadow-[0_8px_30px_-8px_oklch(0.7_0.22_340/.7)] hover:bg-tyl-pink-hover";
