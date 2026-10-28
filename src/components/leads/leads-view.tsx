"use client";

import { Download, Webhook } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataRow, DataTable, EmptyRow } from "@/components/common/data-table";
import { AppSelect } from "@/components/common/modal-select";
import { PageHeader } from "@/components/common/page-header";
import { GhostButton, SearchInput } from "@/components/common/toolbar";
import { useDebounced, useResource } from "@/hooks/use-resource";
import { api, errorMessage } from "@/lib/api";
import { fmtDayTime, hideCpf, hueColor, initials, maskPhone } from "@/lib/format";
import { LeadDeliveriesDialog } from "@/components/leads/lead-deliveries-dialog";
import type { Lead, Page, TylEvent, WebhookStatus } from "@/lib/types";

const COLS = "2fr 1.2fr 1.1fr 1.4fr 1.3fr .9fr 72px";

const HOOK_STYLE: Record<WebhookStatus, { fg: string; bg: string; bd: string; title: string }> = {
  NONE: { fg: "#5a5a5a", bg: "#141414", bd: "#2a2a2a", title: "Nenhum webhook disparado" },
  OK: { fg: "oklch(0.75 0.17 150)", bg: "#0f2418", bd: "#1d4a30", title: "Webhook disparado" },
  ERROR: { fg: "oklch(0.68 0.2 25)", bg: "#2a1212", bd: "#4a1f1f", title: "Erro no disparo" },
};
const ALL = "all";
const PAGE_SIZE = 50;

function query(q: string, eventId: string, page?: number) {
  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  if (eventId !== ALL) p.set("eventId", eventId);
  if (page !== undefined) {
    p.set("page", String(page));
    p.set("size", String(PAGE_SIZE));
  }
  return p.toString();
}

export function LeadsView() {
  const [q, setQ] = useState("");
  const [eventId, setEventId] = useState(ALL);
  const [hookLead, setHookLead] = useState<Lead | null>(null);
  const search = useDebounced(q);
  const { data: events } = useResource<TylEvent[]>("/events");
  const { data: first, loading } = useResource<Page<Lead>>(`/leads?${query(search, eventId, 0)}`);
  const [extra, setExtra] = useState<{ key: string; pages: Page<Lead>[] }>({ key: "", pages: [] });
  const key = query(search, eventId);
  const pages = first ? [first, ...(extra.key === key ? extra.pages : [])] : [];
  const leads = pages.flatMap((p) => p.content);
  const last = pages.at(-1);
  const hasMore = !!last && last.page + 1 < last.totalPages;

  const loadMore = async () => {
    try {
      const next = await api.get<Page<Lead>>(`/leads?${query(search, eventId, (last?.page ?? 0) + 1)}`);
      setExtra({ key, pages: [...(extra.key === key ? extra.pages : []), next] });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const exportCsv = async () => {
    try {
      await api.download(`/leads/export?${key}`, "leads-testyourluck.csv");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Leads" subtitle="Participantes que se cadastraram para girar a máquina">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..." />
        <div className="min-w-[200px]">
          <AppSelect
            size="toolbar"
            value={eventId}
            onChange={setEventId}
            options={[{ value: ALL, label: "Todos os eventos" }, ...(events ?? []).map((e) => ({ value: e.id, label: e.name }))]}
          />
        </div>
        <GhostButton onClick={exportCsv}>
          <Download className="size-[15px]" />
          Exportar CSV
        </GhostButton>
      </PageHeader>

      <DataTable variant="strong" columns={COLS} minWidth={900} headers={["Participante", "Telefone", "CPF", "Evento", "Brinde", "Data", <span key="w" className="block text-center">Webhook</span>]}>
        {leads.map((l) => (
          <DataRow key={l.id} columns={COLS} variant="strong">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1f1f1f] text-xs font-semibold text-[oklch(0.82_0.13_340)]">
                {initials(l.name)}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{l.name}</span>
                <span className="truncate text-xs text-[#8a8a8a]">{l.email || "—"}</span>
              </div>
            </div>
            <span className="font-mono text-[13px] text-[#d4d4d4]">{l.phone ? maskPhone(l.phone) : "—"}</span>
            <span className="font-mono text-[13px] text-[#d4d4d4]">{l.cpf ? hideCpf(l.cpf) : "—"}</span>
            <span>
              <span className="rounded-full border border-input px-2.5 py-[3px] text-xs whitespace-nowrap text-[#d4d4d4]">{l.eventName}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: hueColor(l.productHue) }} />
              {l.productName}
            </span>
            <span className="font-mono text-[13px] text-muted-foreground">{fmtDayTime(l.drawnAt)}</span>
            <div className="flex justify-center">
              <button
                type="button"
                title={HOOK_STYLE[l.webhookStatus ?? "NONE"].title}
                onClick={() => setHookLead(l)}
                className="flex size-[34px] cursor-pointer items-center justify-center rounded-[9px] border"
                style={{ background: HOOK_STYLE[l.webhookStatus ?? "NONE"].bg, borderColor: HOOK_STYLE[l.webhookStatus ?? "NONE"].bd }}
              >
                <Webhook className="size-[17px]" style={{ color: HOOK_STYLE[l.webhookStatus ?? "NONE"].fg }} />
              </button>
            </div>
          </DataRow>
        ))}
        {leads.length === 0 && <EmptyRow loading={loading} message="Nenhum lead encontrado." />}
      </DataTable>

      <div className="flex items-center justify-between text-[13px] text-[#8a8a8a]">
        <span>
          {last?.totalElements ?? 0} {last?.totalElements === 1 ? "lead" : "leads"}
        </span>
        {hasMore && (
          <GhostButton onClick={loadMore} className="h-[34px] text-[13px]">
            Carregar mais
          </GhostButton>
        )}
      </div>

      <LeadDeliveriesDialog lead={hookLead} onClose={() => setHookLead(null)} />
    </div>
  );
}
