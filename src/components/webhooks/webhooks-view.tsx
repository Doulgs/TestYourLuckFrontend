"use client";

import { Pause, Pencil, Play, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataRow, DataTable, EmptyRow } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { RowMenu } from "@/components/common/row-menu";
import { Toggle } from "@/components/common/toggle";
import { PrimaryButton, SearchInput } from "@/components/common/toolbar";
import { WebhookDialog, newWebhookDraft, toDraft, type WebhookDraft } from "@/components/webhooks/webhook-dialog";
import { useResource } from "@/hooks/use-resource";
import { useSelectedEvent } from "@/hooks/use-selected-event";
import { api, errorMessage } from "@/lib/api";
import { HTTP_METHOD_COLORS, fmtTime } from "@/lib/format";
import type { CustomField, DeliverySummary, Webhook } from "@/lib/types";

const COLS = "1.6fr 1.1fr 2.2fr 1.6fr .7fr .7fr 44px";
const OK = { bg: "#132a1e", fg: "oklch(0.8 0.13 155)" };
const ERR = { bg: "#2a1616", fg: "oklch(0.75 0.15 25)" };

const timeWithSeconds = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function WebhooksView() {
  const { data, setData, loading, reload } = useResource<Webhook[]>("/webhooks");
  const { data: logs, reload: reloadLogs } = useResource<DeliverySummary[]>("/webhook-deliveries?limit=8");
  const { data: fields } = useResource<CustomField[]>("/custom-fields");
  const { events, eventId } = useSelectedEvent();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<WebhookDraft | null>(null);
  const [deleting, setDeleting] = useState<Webhook | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((w) => !term || w.name.toLowerCase().includes(term) || w.url.toLowerCase().includes(term));
  }, [data, q]);

  const setActive = async (w: Webhook, active: boolean) => {
    setData((cur) => cur?.map((x) => (x.id === w.id ? { ...x, active } : x)) ?? cur);
    try {
      await api.put(`/webhooks/${w.id}`, { ...w, active });
    } catch (err) {
      toast.error(errorMessage(err));
      void reload();
    }
  };

  const test = async (w: Webhook) => {
    try {
      const d = await api.post<DeliverySummary>(`/webhooks/${w.id}/test`, { eventId });
      if (d.ok) toast.success(`Webhook "${w.name}" disparado`);
      else toast.error(`Webhook "${w.name}" com erro: ${d.status}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      void reload();
      void reloadLogs();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Webhooks" subtitle="Envie os dados do lead para outros sistemas a cada jogada">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar webhook..." />
        <PrimaryButton onClick={() => setDraft(newWebhookDraft(eventId))}>+ Novo webhook</PrimaryButton>
      </PageHeader>

      <DataTable variant="strong" columns={COLS} minWidth={1000} headers={["Nome", "Gatilho", "Endpoint", "Eventos", "Disparos", "Ativo", ""]}>
        {rows.map((w) => {
          const m = HTTP_METHOD_COLORS[w.method];
          const chips = w.eventIds.length ? w.eventIds.map((id) => events.find((e) => e.id === id)?.name ?? "—") : ["Nenhum evento"];
          return (
            <DataRow key={w.id} columns={COLS} variant="strong">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{w.name}</span>
                <span className="text-xs text-[#8a8a8a]">{w.lastDispatchAt ? `Último disparo às ${timeWithSeconds(w.lastDispatchAt)}` : "Ainda não disparado"}</span>
              </div>
              <span className="text-[13px] text-[#d4d4d4]">{w.trigger === "LEAD" ? "Lead cadastrado" : "Jogada concluída"}</span>
              <div className="flex min-w-0 items-center gap-2">
                <span className="rounded-md px-[7px] py-[3px] font-mono text-[11px] font-semibold" style={{ background: m.bg, color: m.fg }}>
                  {w.method}
                </span>
                <span className="truncate font-mono text-xs text-[#d4d4d4]">{w.url}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {chips.map((c, i) => (
                  <span key={i} className="rounded-full border border-input px-2.5 py-[3px] text-xs whitespace-nowrap text-[#d4d4d4]">
                    {c}
                  </span>
                ))}
              </div>
              <span className="font-mono">{w.dispatchCount}</span>
              <Toggle checked={w.active} onChange={(v) => setActive(w, v)} label={`Ativar ${w.name}`} />
              <RowMenu
                items={[
                  { label: "Testar disparo", icon: Send, onSelect: () => test(w) },
                  { label: "Editar", icon: Pencil, onSelect: () => setDraft(toDraft(w)) },
                  { label: w.active ? "Desativar" : "Ativar", icon: w.active ? Pause : Play, onSelect: () => setActive(w, !w.active) },
                  { label: "Excluir", icon: Trash2, danger: true, onSelect: () => setDeleting(w) },
                ]}
              />
            </DataRow>
          );
        })}
        {rows.length === 0 && <EmptyRow loading={loading} message={q ? "Nenhum webhook encontrado." : "Nenhum webhook cadastrado."} />}
      </DataTable>

      <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-[#0a0a0a] p-5">
        <span className="text-[15px] font-semibold">Últimos disparos</span>
        {!logs?.length && <span className="py-2 text-sm text-[#8a8a8a]">Nenhum disparo ainda. Faça uma jogada ou use &quot;Testar&quot;.</span>}
        {logs?.map((l) => {
          const st = l.ok ? OK : ERR;
          return (
            <div key={l.id} className="flex flex-wrap items-center gap-3 border-t border-[#1c1c1c] py-2.5 text-sm">
              <span className="rounded-md px-[7px] py-[3px] font-mono text-[11px] font-semibold" style={{ background: st.bg, color: st.fg }}>
                {l.status}
              </span>
              <span className="font-medium">{l.webhookName}</span>
              <span className="text-[13px] text-muted-foreground">
                {l.method} {l.url.replace(/^https?:\/\//, "")} · {l.test ? "teste" : (l.eventName ?? "—")}
              </span>
              <span className="ml-auto font-mono text-xs text-[#8a8a8a]">{fmtTime(l.sentAt)}</span>
            </div>
          );
        })}
      </div>

      <WebhookDialog draft={draft} events={events} fields={fields ?? []} onClose={() => setDraft(null)} onSaved={reload} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir webhook"
        description={`"${deleting?.name}" deixará de ser disparado. O histórico de disparos dos leads será preservado.`}
        onConfirm={async () => {
          try {
            await api.delete(`/webhooks/${deleting!.id}`);
            toast.success("Webhook excluído");
            await reload();
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </div>
  );
}
