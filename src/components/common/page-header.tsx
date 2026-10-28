import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em]">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children && (
        <div className="flex min-w-0 flex-[1_1_360px] flex-wrap items-center justify-end gap-2">{children}</div>
      )}
    </div>
  );
}
