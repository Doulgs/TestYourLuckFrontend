import { hueColor } from "@/lib/format";
import type { GlyphItem } from "@/lib/machine-types";

/** Círculo do brinde com imagem (quando houver) ou sigla, na cor do matiz, com brilho. */
export function Glyph({
  item,
  size,
  border = 2,
  fontSize,
  glow = true,
}: {
  item: GlyphItem | null;
  size: number;
  border?: number;
  fontSize?: number;
  glow?: boolean;
}) {
  const color = hueColor(item?.hue);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-mono font-semibold"
      style={{
        width: size,
        height: size,
        border: `${border}px solid ${color}`,
        color,
        fontSize: fontSize ?? Math.round(size * 0.3),
        background: item?.imageUrl ? `center/cover no-repeat url("${item.imageUrl}")` : "transparent",
        boxShadow: glow ? `0 0 22px -6px ${color}, inset 0 0 14px -6px ${color}` : undefined,
      }}
    >
      {item?.imageUrl ? "" : item?.short}
    </div>
  );
}

export const toGlyph = (p: { id?: string; productId?: string; name: string; short: string; hue: number; imageUrl: string | null }): GlyphItem => ({
  id: p.id ?? p.productId ?? p.name,
  name: p.name,
  short: p.short,
  hue: p.hue,
  imageUrl: p.imageUrl,
});
