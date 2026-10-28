"use client";

import { Braces, ClipboardPaste, Globe, KeyRound, Link2, Webhook as WebhookIcon, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EventMultiSelect } from "@/components/common/event-multi-select";
import { AppSelect } from "@/components/common/modal-select";
import { MField, ModalShell, mInputClass } from "@/components/common/modal-shell";
import { CurlDialog } from "@/components/webhooks/curl-dialog";
import { KeyValueEditor } from "@/components/webhooks/kv-editor";
import { TemplateEditor } from "@/components/webhooks/template-editor";
import { templateVars, token } from "@/components/webhooks/variables";
import { api, errorMessage } from "@/lib/api";
import { HTTP_METHOD_COLORS } from "@/lib/format";
import type { CustomField, HttpMethod, KeyValue, TylEvent, Webhook, WebhookTrigger } from "@/lib/types";

export type WebhookDraft = {
  id?: string;
  name: string;
  trigger: WebhookTrigger;
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  eventIds: string[];
  active: boolean;
};

type Tab = "headers" | "params" | "body";
const TABS: [Tab, string, string, LucideIcon][] = [
  ["headers", "Headers", "Autenticação e metadados", KeyRound],
  ["params", "Params", "Query string da URL", Link2],
  ["body", "Body", "JSON / payload", Braces],
];
const METHODS: HttpMethod[] = ["POST", "PUT", "PATCH", "GET", "DELETE"];

export function newWebhookDraft(eventId: string | null): WebhookDraft {
  return {
    name: "",
    trigger: "PLAY",
    method: "POST",
    url: "",
    headers: [{ k: "Content-Type", v: "application/json" }],
    params: [],
    body: `{\n  "nome": "${token("lead.nome")}",\n  "email": "${token("lead.email")}",\n  "premio": "${token("premio.nome")}"\n}`,
    eventIds: eventId ? [eventId] : [],
    active: true,
  };
}

export function toDraft(w: Webhook): WebhookDraft {
  return { id: w.id, name: w.name, trigger: w.trigger, method: w.method, url: w.url, headers: w.headers, params: w.params, body: w.body ?? "", eventIds: w.eventIds, active: w.active };
}

export function WebhookDialog({
  draft,
  events,
  fields,
  onClose,
  onSaved,
}: {
  draft: WebhookDraft | null;
  events: TylEvent[];
  fields: CustomField[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [wh, setWh] = useState<WebhookDraft | null>(draft);
  const [tab, setTab] = useState<Tab>("body");
  const [curlOpen, setCurlOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const vars = useMemo(() => templateVars(fields), [fields]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- copia o rascunho ao abrir o modal
    setWh(draft);
    setTab("body");
  }, [draft]);

  if (!wh) return null;
  const set = (patch: Partial<WebhookDraft>) => setWh((c) => (c ? { ...c, ...patch } : c));
  const qs = wh.params.filter((p) => p.k).map((p) => `${p.k}=${p.v}`).join("&");
  const mColor = HTTP_METHOD_COLORS[wh.method];

  const save = async () => {
    if (!wh.name.trim() || !wh.url.trim()) {
      toast.error("Informe nome e URL");
      return;
    }
    setSaving(true);
    const body = { ...wh, headers: wh.headers.filter((h) => h.k), params: wh.params.filter((p) => p.k) };
    try {
      if (wh.id) await api.put(`/webhooks/${wh.id}`, body);
      else await api.post("/webhooks", body);
      toast.success("Webhook salvo");
      onClose();
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalShell
        open={!!draft}
        onOpenChange={(o) => !o && onClose()}
        icon={WebhookIcon}
        title="Configurar webhook"
        subtitle="Defina método, URL, headers, query params e body ou cole um cURL e preencha tudo de uma vez"
        maxWidth={1040}
        bodyClassName="p-0"
        submitLabel="Salvar configuração"
        submitting={saving}
        onSubmit={save}
        headerExtra={
          <button
            type="button"
            onClick={() => setCurlOpen(true)}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-input bg-[#141414] px-3.5 text-sm font-medium whitespace-nowrap"
          >
            <ClipboardPaste className="size-4" /> Colar cURL
          </button>
        }
        footerStart={
          <>
            <span className="rounded-lg px-2.5 py-[5px] font-mono text-xs font-semibold tracking-[0.1em] whitespace-nowrap" style={{ background: mColor.bg, color: mColor.fg }}>
              ● {wh.method}
            </span>
            <span className="min-w-0 truncate font-mono text-xs text-[#8a8a8a]">{(wh.url || "—") + (qs ? `?${qs}` : "")}</span>
          </>
        }
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5 border-b border-[#1f1f1f] px-[22px] py-[18px]">
          <MField label="Nome">
            <input className={mInputClass} placeholder="Ex.: CRM — novo lead" value={wh.name} onChange={(e) => set({ name: e.target.value })} />
          </MField>
          <MField label="Eventos vinculados">
            <EventMultiSelect events={events} value={wh.eventIds} onChange={(eventIds) => set({ eventIds })} />
          </MField>
          <MField label="Gatilho">
            <AppSelect
              value={wh.trigger}
              onChange={(v) => set({ trigger: v as WebhookTrigger })}
              className="bg-[#141414]! dark:bg-[#141414]!"
              options={[
                { value: "LEAD", label: "Lead cadastrado" },
                { value: "PLAY", label: "Jogada concluída" },
              ]}
            />
          </MField>
        </div>
        <div className="grid grid-cols-1 gap-3.5 border-b border-[#1f1f1f] px-[22px] py-[18px] min-[700px]:grid-cols-[180px_minmax(0,1fr)]">
          <MField label="Método">
            <AppSelect value={wh.method} onChange={(v) => set({ method: v as HttpMethod })} options={METHODS.map((m) => ({ value: m, label: m }))} className="h-12! rounded-xl! bg-[#141414]! text-[15px] dark:bg-[#141414]!" />
          </MField>
          <MField label="URL">
            <div className="flex h-12 items-center gap-2.5 rounded-xl border border-input bg-[#141414] px-3.5 focus-within:border-ring">
              <Globe className="size-[18px] shrink-0 opacity-70" />
              <input
                className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-[#737373]"
                placeholder="https://api.exemplo.com/v1/leads"
                value={wh.url}
                onChange={(e) => set({ url: e.target.value })}
              />
            </div>
          </MField>
        </div>
        <div className="grid grid-cols-3 border-b border-[#1f1f1f] px-[22px] pt-3.5">
          {TABS.map(([k, label, sub, Icon]) => {
            const on = tab === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className="-mb-px flex min-w-0 cursor-pointer items-center gap-3 rounded-t-[14px] border border-b-0 px-4 py-3.5 text-left"
                style={{ background: on ? "#0f0f0f" : "transparent", borderColor: on ? "#262626" : "transparent" }}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-input" style={{ background: on ? "#2b1528" : "#141414" }}>
                  <Icon className="size-4" style={{ color: on ? "#F36ACB" : "#a1a1a1" }} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold" style={{ color: on ? "#fafafa" : "#a1a1a1" }}>
                    {label}
                  </span>
                  <span className="truncate text-xs text-[#8a8a8a]">{sub}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2.5 bg-[#0f0f0f] px-[22px] py-[18px]">
          <div className="flex flex-wrap justify-between gap-2.5">
            <span className="text-[11px] font-semibold tracking-[0.12em] text-[#8a8a8a]">{{ headers: "HEADERS", params: "QUERY PARAMS", body: "BODY" }[tab]}</span>
            <span className="text-xs text-[#8a8a8a]">
              Digite <span className="font-mono text-tyl-pink">@</span> para inserir variáveis
            </span>
          </div>
          {tab === "body" ? (
            <TemplateEditor value={wh.body} onChange={(body) => set({ body })} vars={vars} />
          ) : (
            <KeyValueEditor key={tab} rows={wh[tab]} onChange={(rows) => set({ [tab]: rows })} vars={vars} />
          )}
        </div>
      </ModalShell>
      <CurlDialog
        open={curlOpen}
        onOpenChange={setCurlOpen}
        onImport={(p) => {
          set({ ...p, body: p.body ?? wh.body });
          setTab(p.body ? "body" : "headers");
        }}
      />
    </>
  );
}
