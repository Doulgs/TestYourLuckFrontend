"use client";

import { Dices, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataRow, DataTable, EmptyRow } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { RowMenu } from "@/components/common/row-menu";
import { PrimaryButton, SearchInput } from "@/components/common/toolbar";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { useResource } from "@/hooks/use-resource";
import { api, errorMessage } from "@/lib/api";
import { EVENT_STATUS, fmtDate, hhmm } from "@/lib/format";
import type { TylEvent } from "@/lib/types";

const COLS = "2.2fr 1.3fr 1.5fr .9fr 1fr 44px";

function period(e: TylEvent): string {
  const d1 = fmtDate(e.startDate);
  if (e.endDate && e.endDate !== e.startDate) return `${d1.slice(0, 5)} – ${fmtDate(e.endDate)}`;
  return d1;
}

const hours = (e: TylEvent) => (e.allDay ? "Dia todo" : `${hhmm(e.startTime) || "--:--"} – ${hhmm(e.endTime) || "--:--"}`);

export function EventsView() {
  const router = useRouter();
  const { data, loading, reload } = useResource<TylEvent[]>("/events");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<TylEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<TylEvent | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (e) => !term || e.name.toLowerCase().includes(term) || [e.place, e.city].some((v) => (v ?? "").toLowerCase().includes(term)),
    );
  }, [data, q]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Eventos" subtitle="Cada evento tem seu próprio estoque e histórico de sorteios">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar evento..." />
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Novo evento
        </PrimaryButton>
      </PageHeader>

      <DataTable columns={COLS} minWidth={900} headers={["Evento", "Período", "Local", "Status", "Sorteios", ""]}>
        {rows.map((e) => (
          <DataRow key={e.id} columns={COLS}>
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg border border-input"
                style={{ background: e.bannerUrl ? `center/cover no-repeat url("${e.bannerUrl}")` : "#141414" }}
              >
                {!e.bannerUrl && <ImageIcon className="size-3.5 opacity-25" />}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{e.name}</span>
                <span className="truncate text-xs text-[#8a8a8a]">{e.website ? e.website.replace(/^https?:\/\//, "") : "Sem website"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#d4d4d4]">{period(e)}</span>
              <span className="text-xs text-[#8a8a8a]">{hours(e)}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[#d4d4d4]">{[e.city, e.uf].filter(Boolean).join(" / ") || "—"}</span>
              <span className="truncate text-xs text-[#8a8a8a]">{e.place ?? ""}</span>
            </div>
            <span>
              <Pill {...EVENT_STATUS[e.status]} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono">
                {e.draws} / {e.maxDraws > 0 ? e.maxDraws : "∞"}
              </span>
              <span className="text-[11px] text-[#8a8a8a]">{e.allowOutside ? "Fora da data: permitido" : "Só no período"}</span>
            </div>
            <RowMenu
              items={[
                { label: "Abrir sorteio", icon: Dices, onSelect: () => router.push(`/sorteios?evento=${e.id}`) },
                {
                  label: "Editar",
                  icon: Pencil,
                  onSelect: () => {
                    setEditing(e);
                    setFormOpen(true);
                  },
                },
                { label: "Excluir", icon: Trash2, danger: true, onSelect: () => setDeleting(e) },
              ]}
            />
          </DataRow>
        ))}
        {rows.length === 0 && <EmptyRow loading={loading} message={q ? "Nenhum evento encontrado." : "Nenhum evento cadastrado."} />}
      </DataTable>

      <EventFormDialog event={editing} open={formOpen} onOpenChange={setFormOpen} onSaved={reload} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir evento"
        description={`"${deleting?.name}" sairá das listagens. Leads e histórico de sorteios serão preservados.`}
        onConfirm={async () => {
          try {
            await api.delete(`/events/${deleting!.id}`);
            toast.success("Evento excluído");
            await reload();
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </div>
  );
}
