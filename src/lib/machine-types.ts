// Tipos da máquina de sorteio (configuração, pool, participante, jogada) — ver backend/docs/api-contract.md

export type GameStyle = "SLOT" | "WHEEL" | "SLIDER" | "BLOCKS";
export type MachineSize = "P" | "M" | "G" | "F";
export type MachineBackground = "PRETO" | "GRAFITE" | "COR";
export type LogoMode = "DEFAULT" | "CUSTOM";

export type DrawSettings = {
  style: GameStyle;
  size: MachineSize;
  credits: number;
  primaryColor: string;
  background: MachineBackground;
  logoMode: LogoMode;
  logoMediaId: string | null;
  logoUrl: string | null;
  title: string;
  winMessage: string;
  askEmail: boolean;
  askPhone: boolean;
  askCpf: boolean;
  lights: boolean;
  sound: boolean;
  showPrizes: boolean;
  customFieldIds: string[];
};

export type MachineProduct = { id: string; name: string; short: string; hue: number; imageUrl: string | null };

export type EventBlock = "INACTIVE" | "LIMIT" | "OUTSIDE_PERIOD";

export type MachinePoolItem = {
  productId: string;
  name: string;
  short: string;
  hue: number;
  imageUrl: string | null;
  weight: number;
  quantity: number;
  chance: number;
};

export type MachinePool = {
  eventId: string;
  eventName: string;
  eventStatus: string;
  draws: number;
  block: EventBlock | null;
  blockMessage: string | null;
  items: MachinePoolItem[];
};

export type ParticipantResult = { id: string; name: string; credits: number; creditsRemaining: number };

export type MachineDrawResult = {
  id: string;
  eventId: string;
  eventName: string;
  participantId: string;
  participantName: string;
  drawnAt: string;
  product: MachineProduct;
  eventDraws: number;
  poolCount: number;
  creditsRemaining: number;
};

export type MachineField = {
  id: string;
  label: string;
  key: string;
  token: string;
  type: "TEXT" | "NUMBER" | "DATE" | "SELECT" | "BOOL";
  options: string[];
  placeholder: string | null;
  required: boolean;
  active: boolean;
};

/** Item exibido nas animações (produto do catálogo ou do pool). */
export type GlyphItem = { id: string; name: string; short: string; hue: number; imageUrl: string | null };
