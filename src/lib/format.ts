import type { EventStatus, StockStatus } from "@/lib/types";

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function maskCpf(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CPF parcial para listagens: 000.***.***-00 */
export function hideCpf(cpf: string | null): string {
  const d = onlyDigits(cpf ?? "");
  if (d.length !== 11) return "—";
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
}

/** YYYY-MM-DD → dd/mm/aaaa */
export function fmtDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtDayTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${fmtTime(iso)}`;
}

export const fmtInt = (n: number) => n.toLocaleString("pt-BR");
export const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export function fmtChange(n: number | null): string {
  if (n === null) return "Novo";
  const s = Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${n >= 0 ? "+" : "-"}${s}%`;
}

/** Cor do produto a partir do matiz (mesma fórmula do design). */
export const hueColor = (hue: number | null | undefined) => (hue == null ? "#666666" : `oklch(0.76 0.15 ${hue})`);

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export const EVENT_STATUS: Record<EventStatus, { label: string; bg: string; fg: string }> = {
  ATIVO: { label: "Ativo", bg: "#132a1e", fg: "var(--tyl-green)" },
  RASCUNHO: { label: "Rascunho", bg: "#222222", fg: "#a1a1a1" },
  ENCERRADO: { label: "Encerrado", bg: "#2a1616", fg: "var(--tyl-red)" },
};

export const STOCK_STATUS: Record<StockStatus, { label: string; bg: string; fg: string }> = {
  OK: { label: "OK", bg: "#132a1e", fg: "var(--tyl-green)" },
  BAIXO: { label: "Estoque baixo", bg: "#1f1f1f", fg: "#F36ACB" },
  ESGOTADO: { label: "Esgotado", bg: "#2a1616", fg: "var(--tyl-red)" },
};

/** "HH:mm:ss" → "HH:mm" (input type=time) */
export const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : "");

/** Máscara de CEP 00000-000 */
export function maskCep(v: string): string {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export const HTTP_METHOD_COLORS: Record<string, { bg: string; fg: string }> = {
  GET: { bg: "#132a1e", fg: "oklch(0.8 0.13 155)" },
  POST: { bg: "#2a2410", fg: "oklch(0.85 0.14 85)" },
  PUT: { bg: "#10202a", fg: "oklch(0.8 0.12 230)" },
  PATCH: { bg: "#1f1530", fg: "oklch(0.8 0.12 300)" },
  DELETE: { bg: "#2a1616", fg: "oklch(0.75 0.12 25)" },
};

export const UFS: [string, string, string][] = [
  ["AC", "Acre", "Norte"], ["AL", "Alagoas", "Nordeste"], ["AP", "Amapá", "Norte"], ["AM", "Amazonas", "Norte"],
  ["BA", "Bahia", "Nordeste"], ["CE", "Ceará", "Nordeste"], ["DF", "Distrito Federal", "Centro-Oeste"],
  ["ES", "Espírito Santo", "Sudeste"], ["GO", "Goiás", "Centro-Oeste"], ["MA", "Maranhão", "Nordeste"],
  ["MT", "Mato Grosso", "Centro-Oeste"], ["MS", "Mato Grosso do Sul", "Centro-Oeste"], ["MG", "Minas Gerais", "Sudeste"],
  ["PA", "Pará", "Norte"], ["PB", "Paraíba", "Nordeste"], ["PR", "Paraná", "Sul"], ["PE", "Pernambuco", "Nordeste"],
  ["PI", "Piauí", "Nordeste"], ["RJ", "Rio de Janeiro", "Sudeste"], ["RN", "Rio Grande do Norte", "Nordeste"],
  ["RS", "Rio Grande do Sul", "Sul"], ["RO", "Rondônia", "Norte"], ["RR", "Roraima", "Norte"],
  ["SC", "Santa Catarina", "Sul"], ["SP", "São Paulo", "Sudeste"], ["SE", "Sergipe", "Nordeste"], ["TO", "Tocantins", "Norte"],
];

export const TIMEZONES: [string, string][] = [
  ["America/Sao_Paulo", "Brasília (GMT-3)"], ["America/Manaus", "Manaus (GMT-4)"], ["America/Cuiaba", "Cuiabá (GMT-4)"],
  ["America/Rio_Branco", "Rio Branco (GMT-5)"], ["America/Noronha", "Fernando de Noronha (GMT-2)"],
  ["America/Fortaleza", "Fortaleza (GMT-3)"], ["America/Belem", "Belém (GMT-3)"],
];

export const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
