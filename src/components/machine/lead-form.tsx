"use client";

import { useState } from "react";
import type { LeadPayload } from "@/hooks/use-game-session";
import { maskCpf, maskPhone, onlyDigits } from "@/lib/format";
import type { DrawSettings, MachineField } from "@/lib/machine-types";
import { Toggle } from "@/components/common/toggle";
import type { MachineColors } from "./theme";

const inputClass =
  "h-[52px] w-full min-w-0 rounded-xl border border-input bg-[#141414] px-4 text-base outline-none placeholder:text-[#737373] focus:border-ring focus:shadow-[0_0_0_3px_rgba(255,255,255,.06)] [color-scheme:dark]";

type Values = { name: string; email: string; phone: string; cpf: string; custom: Record<string, string | boolean> };
const EMPTY: Values = { name: "", email: "", phone: "", cpf: "", custom: {} };

/** Mesma ordem e mensagens de validação do servidor (o servidor revalida). */
function validate(v: Values, s: DrawSettings, fields: MachineField[]): string | null {
  if (!v.name.trim()) return "Informe seu nome.";
  if (s.askEmail && !/^\S+@\S+\.\S+$/.test(v.email.trim())) return "Informe um e-mail válido.";
  if (s.askPhone && onlyDigits(v.phone).length < 10) return "Informe um telefone válido.";
  if (s.askCpf && onlyDigits(v.cpf).length !== 11) return "Informe um CPF válido.";
  for (const f of fields) {
    if (f.required && f.type !== "BOOL" && !String(v.custom[f.key] ?? "").trim()) return `Preencha: ${f.label}`;
  }
  return null;
}

/** Cadastro do participante sobre a máquina: libera os créditos configurados. */
export function LeadForm({
  settings,
  fields,
  pri,
  onSubmit,
  onCancel,
}: {
  settings: DrawSettings;
  fields: MachineField[];
  pri: MachineColors;
  onSubmit: (payload: LeadPayload) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<Values>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Values>) => {
    setV((cur) => ({ ...cur, ...patch }));
    setError(null);
  };
  const setCustom = (key: string, value: string | boolean) => set({ custom: { ...v.custom, [key]: value } });

  const submit = async () => {
    const err = validate(v, settings, fields);
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    const answers: Record<string, string | boolean> = {};
    fields.forEach((f) => {
      answers[f.key] = f.type === "BOOL" ? !!v.custom[f.key] : String(v.custom[f.key] ?? "");
    });
    const serverError = await onSubmit({
      name: v.name.trim(),
      email: settings.askEmail ? v.email.trim() : undefined,
      phone: settings.askPhone ? onlyDigits(v.phone) : undefined,
      cpf: settings.askCpf ? onlyDigits(v.cpf) : undefined,
      answers,
    });
    setBusy(false);
    if (serverError) setError(serverError);
  };

  return (
    <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/85 p-5 backdrop-blur-[8px]">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex max-h-full w-full max-w-[440px] flex-col gap-3 overflow-y-auto p-1"
      >
        <div className="mb-1.5 flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-[28px] font-bold tracking-[-0.01em]">{settings.title}</h2>
          <p className="text-[15px] text-muted-foreground">
            Preencha seus dados para liberar {settings.credits} {settings.credits === 1 ? "crédito" : "créditos"}
          </p>
        </div>
        <input placeholder="Nome completo" autoComplete="off" className={inputClass} value={v.name} onChange={(e) => set({ name: e.target.value })} />
        {settings.askEmail && (
          <input placeholder="E-mail" type="email" autoComplete="off" className={inputClass} value={v.email} onChange={(e) => set({ email: e.target.value })} />
        )}
        {settings.askPhone && (
          <input placeholder="Telefone" inputMode="numeric" className={inputClass} value={v.phone} onChange={(e) => set({ phone: maskPhone(e.target.value) })} />
        )}
        {settings.askCpf && (
          <input placeholder="CPF" inputMode="numeric" className={inputClass} value={v.cpf} onChange={(e) => set({ cpf: maskCpf(e.target.value) })} />
        )}
        {fields.map((f) => {
          const ph = `${f.placeholder || f.label}${f.required ? " *" : ""}`;
          const value = v.custom[f.key];
          if (f.type === "BOOL") {
            return (
              <div
                key={f.id}
                onClick={() => setCustom(f.key, !value)}
                className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-input bg-[#141414] px-4 py-2.5"
              >
                <span className="flex-1 text-[15px] text-[#d4d4d4]">
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                <Toggle checked={!!value} onChange={(c) => setCustom(f.key, c)} label={f.label} />
              </div>
            );
          }
          if (f.type === "SELECT") {
            return (
              <select
                key={f.id}
                className={inputClass}
                style={{ color: value ? "#fafafa" : "#7d7d7d" }}
                value={String(value ?? "")}
                onChange={(e) => setCustom(f.key, e.target.value)}
              >
                <option value="">{ph}</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <input
              key={f.id}
              type={f.type === "NUMBER" ? "number" : f.type === "DATE" ? "date" : "text"}
              placeholder={ph}
              className={inputClass}
              value={String(value ?? "")}
              onChange={(e) => setCustom(f.key, e.target.value)}
            />
          );
        })}
        {error && <div className="text-[13px] text-[oklch(0.8_0.13_25)]">{error}</div>}
        <button
          type="submit"
          disabled={busy}
          className="mt-1 h-14 cursor-pointer rounded-full text-base font-semibold disabled:opacity-60"
          style={{ background: pri.c, color: pri.on }}
        >
          {busy ? "Liberando..." : "Liberar créditos"}
        </button>
        <button type="button" onClick={onCancel} className="h-10 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          Cancelar
        </button>
        <p className="text-center text-xs text-[#737373]">Seus dados são usados apenas para registro do sorteio.</p>
      </form>
    </div>
  );
}
