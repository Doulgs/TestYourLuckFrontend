import type { CustomField } from "@/lib/types";

export type TemplateVar = { k: string; label: string; group: string };

/** Variáveis disponíveis nos templates de webhook (mesmas chaves do servidor). */
export function templateVars(fields: CustomField[]): TemplateVar[] {
  const groups: [string, [string, string][]][] = [
    ["Lead", [["lead.nome", "Nome"], ["lead.email", "E-mail"], ["lead.telefone", "Telefone"], ["lead.cpf", "CPF"]]],
    ["Campo", fields.map((f) => [`campo.${f.key}`, f.label])],
    ["Evento", [["evento.id", "ID do evento"], ["evento.nome", "Nome do evento"], ["evento.local", "Local"]]],
    ["Prêmio", [["premio.nome", "Nome do prêmio"], ["premio.sku", "SKU"], ["premio.categoria", "Categoria"]]],
    ["Jogo", [["jogo.estilo", "Estilo do jogo"], ["jogo.data_hora", "Data e hora (ISO)"]]],
  ];
  return groups.flatMap(([group, items]) => items.map(([k, label]) => ({ k, label, group })));
}

export const token = (k: string) => `{{${k}}}`;

export function filterVars(vars: TemplateVar[], q: string): TemplateVar[] {
  const t = q.toLowerCase();
  return vars.filter((v) => !t || v.k.toLowerCase().includes(t) || v.label.toLowerCase().includes(t));
}

export type Mention = { start: number; end: number; q: string; idx: number; line: number; col: number };

/** Detecta "@termo" imediatamente antes do cursor. */
export function detectMention(value: string, pos: number): Mention | null {
  const before = value.slice(0, pos);
  const m = before.match(/@([\w.]*)$/);
  if (!m) return null;
  const lines = before.split("\n");
  return { start: pos - m[0].length, end: pos, q: m[1], idx: 0, line: lines.length - 1, col: lines[lines.length - 1].length - m[0].length };
}

export function applyMention(value: string, m: Mention, k: string): { value: string; caret: number } {
  const t = token(k);
  return { value: value.slice(0, m.start) + t + value.slice(m.end), caret: m.start + t.length };
}
