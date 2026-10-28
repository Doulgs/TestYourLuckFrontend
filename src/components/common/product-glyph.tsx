import { hueColor } from "@/lib/format";

/** Círculo com a imagem do produto ou a sigla na cor do seu matiz. */
export function ProductGlyph({
  short,
  hue,
  imageUrl,
  size = 32,
}: {
  short: string;
  hue: number | null;
  imageUrl?: string | null;
  size?: number;
}) {
  const color = hueColor(hue);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-mono font-semibold"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        color,
        fontSize: Math.max(9, Math.round(size * 0.34)),
        background: imageUrl ? `center/cover no-repeat url("${imageUrl}")` : "transparent",
      }}
    >
      {imageUrl ? "" : short}
    </div>
  );
}
