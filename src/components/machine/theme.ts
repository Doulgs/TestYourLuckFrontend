import type { DrawSettings, GameStyle, MachineBackground, MachineSize } from "@/lib/machine-types";

export type MachineColors = { c: string; soft: string; glow: string; on: string };

/** Cor principal da máquina com variações; o texto sobre ela é escuro em cores claras (luminância > 0,6). */
export function machineColors(hex: string): MachineColors {
  const safe = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#F36ACB";
  const [r, g, b] = [1, 3, 5].map((k) => parseInt(safe.slice(k, k + 2), 16));
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return { c: safe, soft: `${safe}33`, glow: `${safe}99`, on: lum > 0.6 ? "#111111" : "#ffffff" };
}

export function stageBackground(bg: MachineBackground, hex: string): string {
  if (bg === "GRAFITE") return "#121212";
  if (bg === "COR") return `radial-gradient(70% 60% at 50% 0%, ${hex}40 0%, #000 72%)`;
  return "#000000";
}

export const STYLE_MESSAGE: Record<GameStyle, string> = {
  SLOT: "PUXE A ALAVANCA",
  WHEEL: "GIRE A ROLETA",
  SLIDER: "PRONTO PARA SORTEAR",
  BLOCKS: "TOQUE EM UM BLOCO",
};

export const STYLE_BUTTON: Record<Exclude<GameStyle, "BLOCKS">, string> = {
  SLOT: "GIRAR",
  WHEEL: "GIRAR ROLETA",
  SLIDER: "SORTEAR",
};

/** Altura aproximada do gabinete por estilo, usada no ajuste "Tela cheia". */
const CABINET_HEIGHT: Record<GameStyle, number> = { SLOT: 820, WHEEL: 960, SLIDER: 700, BLOCKS: 820 };
const SCALE: Record<Exclude<MachineSize, "F">, number> = { P: 0.75, M: 0.9, G: 1.1 };

/** Zoom do gabinete de 720px conforme tamanho, espaço disponível e contexto (pré-visualização ou jogo). */
export function machineZoom(s: Pick<DrawSettings, "size" | "style">, availW: number, availH: number, play: boolean): number {
  const fitW = availW / 720;
  if (s.size === "F") {
    return Math.max(0.3, Math.min(fitW, (availH - 110) / (CABINET_HEIGHT[s.style] + 60)));
  }
  const scale = SCALE[s.size];
  return Math.max(0.3, play ? Math.min(scale, fitW) : Math.min(scale * 0.8, fitW));
}

export const DEFAULT_LOGO = "/assets/logo-tyl.png";
export const STYLE_LABEL: Record<GameStyle, string> = { SLOT: "caca-niquel", WHEEL: "roleta", SLIDER: "slider", BLOCKS: "blocos" };
