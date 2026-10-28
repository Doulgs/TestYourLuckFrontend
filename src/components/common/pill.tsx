export function Pill({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <span className="rounded-full px-[9px] py-[3px] text-xs whitespace-nowrap" style={{ background: bg, color: fg }}>
      {label}
    </span>
  );
}
