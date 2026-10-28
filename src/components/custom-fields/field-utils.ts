import type { FieldType } from "@/lib/types";

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Texto curto",
  NUMBER: "Número",
  DATE: "Data",
  SELECT: "Seleção",
  BOOL: "Sim / Não",
};

/** Mesma normalização do servidor: minúsculas, sem acentos, "_" como separador, até 32 caracteres. */
export function slugKey(v: string): string {
  const s = v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return s.slice(0, 32).replace(/_$/, "");
}
