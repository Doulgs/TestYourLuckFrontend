import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchInput(props: ComponentProps<"input">) {
  return (
    <Input
      name="q"
      type="search"
      aria-label={props.placeholder}
      {...props}
      className={cn("h-[38px] max-w-[420px] min-w-0 flex-[1_1_240px] rounded-[10px] bg-[#141414] px-3 text-sm", props.className)}
    />
  );
}

export function PrimaryButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn("h-[38px] shrink-0 rounded-[10px] px-4 text-sm font-semibold hover:bg-tyl-pink-hover", className)}
    />
  );
}

export function GhostButton({ className, children, ...props }: ComponentProps<typeof Button> & { children: ReactNode }) {
  return (
    <Button
      variant="outline"
      {...props}
      className={cn("h-[38px] shrink-0 rounded-[10px] border-input bg-[#141414] px-3.5 text-sm font-normal", className)}
    >
      {children}
    </Button>
  );
}
