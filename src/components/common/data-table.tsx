import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tabela em grid do design: rolagem horizontal, cabeçalho e linhas com o mesmo template de colunas. */
export function DataTable({
  columns,
  minWidth,
  headers,
  children,
  variant = "plain",
  empty,
}: {
  columns: string;
  minWidth: number;
  headers: ReactNode[];
  children: ReactNode;
  variant?: "plain" | "strong";
  empty?: ReactNode;
}) {
  const style = { gridTemplateColumns: columns } as CSSProperties;
  return (
    <div className={cn("overflow-x-auto border border-border bg-[#0a0a0a]", variant === "strong" ? "rounded-2xl" : "rounded-[14px]")}>
      <div style={{ minWidth }}>
        <div
          style={style}
          className={cn(
            "grid gap-3 border-b border-border",
            variant === "strong"
              ? "bg-[#141414] px-5 py-3.5 text-[13px] font-medium text-[#d4d4d4]"
              : "px-[18px] py-3 text-xs text-[#8a8a8a]",
          )}
        >
          {headers.map((h, i) => (
            <span key={i} className={i === headers.length - 1 && h === "Ações" ? "text-right" : undefined}>
              {h}
            </span>
          ))}
        </div>
        {children}
        {empty}
      </div>
    </div>
  );
}

export function DataRow({
  columns,
  children,
  variant = "plain",
}: {
  columns: string;
  children: ReactNode;
  variant?: "plain" | "strong";
}) {
  return (
    <div
      style={{ gridTemplateColumns: columns }}
      className={cn(
        "grid items-center gap-3 border-b border-[#1c1c1c] text-sm last:border-b-0",
        variant === "strong" ? "px-5 py-3.5" : "px-[18px] py-3",
      )}
    >
      {children}
    </div>
  );
}

export function EmptyRow({ loading, message }: { loading: boolean; message: string }) {
  return <div className="px-5 py-10 text-center text-sm text-[#8a8a8a]">{loading ? "Carregando..." : message}</div>;
}
