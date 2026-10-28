type Pt = [number, number];

const f1 = (n: number) => n.toFixed(1);

/** Curva suave (Catmull-Rom → Bézier), igual ao protótipo. */
function smooth(p: Pt[]): string {
  if (p.length === 0) return "";
  let d = `M${f1(p[0][0])},${f1(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d;
}

export const SERIES_COLORS = ["oklch(0.72 0.2 340)", "#d4d4d4"];

export function AreaChart({ series }: { series: number[][] }) {
  const max = Math.max(1, ...series.flat()) * 1.15;
  const paths = series.map((values) => {
    const pts: Pt[] = values.map((v, i) => [values.length > 1 ? (i / (values.length - 1)) * 1000 : 500, 300 - (v / max) * 270]);
    const line = smooth(pts);
    return { line, area: `${line} L1000,300 L0,300 Z` };
  });
  return (
    <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="block h-[220px] w-full overflow-visible">
      <defs>
        <linearGradient id="tylA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.72 0.2 340)" stopOpacity={0.45} />
          <stop offset="1" stopColor="oklch(0.72 0.2 340)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="tylB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4d4d4" stopOpacity={0.2} />
          <stop offset="1" stopColor="#d4d4d4" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[40, 105, 170, 235].map((y) => (
        <line key={y} x1={0} x2={1000} y1={y} y2={y} stroke="#1f1f1f" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
      {paths[1] && <path d={paths[1].area} fill="url(#tylB)" />}
      {paths[0] && <path d={paths[0].area} fill="url(#tylA)" />}
      {paths[1] && <path d={paths[1].line} fill="none" stroke="#d4d4d4" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
      {paths[0] && <path d={paths[0].line} fill="none" stroke="oklch(0.78 0.18 340)" strokeWidth={2} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

export function BarChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-[220px] items-end gap-1.5 border-b border-[#1f1f1f]">
      {values.map((v, i) => (
        <div
          key={i}
          title={String(v)}
          className="min-w-0 flex-1 rounded-t-md"
          style={{
            height: `${Math.max(4, Math.round((v / max) * 100))}%`,
            background: i === values.length - 1 ? "oklch(0.72 0.2 340)" : "oklch(0.72 0.2 340 / .55)",
          }}
        />
      ))}
    </div>
  );
}

export function XLabels({ labels, compact }: { labels: string[]; compact: boolean }) {
  return (
    <div className="flex justify-between font-mono text-[11px] text-[#8a8a8a]">
      {labels.map((t, i) => (
        <span key={i}>{compact && labels.length > 7 && i % 2 ? "" : t}</span>
      ))}
    </div>
  );
}
