"use client";

import { Copy, Webhook } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "@/components/common/modal-shell";
import { useResource } from "@/hooks/use-resource";
import { fmtDayTime, fmtTime } from "@/lib/format";
import type { DeliveryDetail, Lead } from "@/lib/types";

const OK = { bg: "#132a1e", fg: "oklch(0.8 0.13 155)" };
const ERR = { bg: "#2a1616", fg: "oklch(0.75 0.15 25)" };

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Modal "Disparos de webhook" do lead: um cartão por disparo com o JSON de request/response. */
export function LeadDeliveriesDialog({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { data, loading } = useResource<DeliveryDetail[]>(lead ? `/leads/${lead.id}/deliveries` : null);
  const items = lead ? (data ?? []) : [];

  return (
    <ModalShell
      open={!!lead}
      onOpenChange={(o) => !o && onClose()}
      icon={Webhook}
      title="Disparos de webhook"
      subtitle={lead ? `${lead.name} · ${lead.eventName} · ${fmtDayTime(lead.drawnAt)}` : ""}
      footerStart={
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#8a8a8a]">
          <Legend color="oklch(0.75 0.17 150)" label="Disparado" />
          <Legend color="oklch(0.68 0.2 25)" label="Erro" />
          <Legend color="#5a5a5a" label="Não disparado" />
        </div>
      }
      footerActions={
        <button type="button" onClick={onClose} className="h-[42px] cursor-pointer rounded-xl bg-tyl-pink px-[18px] text-sm font-semibold text-white">
          Fechar
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {loading && items.length === 0 && <div className="py-6 text-center text-sm text-[#8a8a8a]">Carregando...</div>}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-input p-7 text-center">
            <Webhook className="size-7 text-[#5a5a5a]" />
            <span className="text-[15px] font-medium">Nenhum webhook foi disparado para este lead</span>
            <span className="text-[13px] text-[#8a8a8a]">Não havia webhook ativo vinculado ao evento no momento da jogada.</span>
          </div>
        )}
        {items.map((d) => {
          const json = JSON.stringify({ webhook: d.webhookName, enviado_em: d.sentAt, request: d.request, response: d.response }, null, 2);
          const st = d.ok ? OK : ERR;
          return (
            <div key={d.id} className="overflow-hidden rounded-[14px] border border-border bg-[#0f0f0f]">
              <div className="flex flex-wrap items-center gap-2.5 border-b border-[#1f1f1f] px-3.5 py-3">
                <span className="rounded-md px-2 py-[3px] font-mono text-[11px] font-semibold" style={{ background: st.bg, color: st.fg }}>
                  {d.status}
                </span>
                <span className="text-sm font-semibold">{d.webhookName}</span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                  {d.method} {d.url}
                </span>
                <span className="font-mono text-xs text-[#8a8a8a]">{fmtTime(d.sentAt)}</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(json);
                    } catch {
                      // área de transferência indisponível
                    }
                    toast.success("JSON copiado");
                  }}
                  className="flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-[#141414] px-2.5 text-xs"
                >
                  <Copy className="size-[13px]" /> Copiar
                </button>
              </div>
              <pre className="m-0 max-h-[360px] overflow-auto bg-[#050505] px-4 py-3.5 font-mono text-[12.5px] leading-relaxed whitespace-pre text-[#e5e5e5]">{json}</pre>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}
