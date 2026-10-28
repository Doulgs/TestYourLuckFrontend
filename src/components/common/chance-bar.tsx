export function ChanceBar({ pct, color, labelWidth = 44 }: { pct: number; color: string; labelWidth?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#222222]">
        <div className="h-full" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
      <span className="text-right font-mono text-xs text-[#d4d4d4]" style={{ width: labelWidth }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}
