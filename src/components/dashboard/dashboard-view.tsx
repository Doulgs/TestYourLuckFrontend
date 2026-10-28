"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AreaChart, BarChart, SERIES_COLORS, XLabels } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/common/page-header";
import { PrimaryButton } from "@/components/common/toolbar";
import { useResource } from "@/hooks/use-resource";
import { useViewportWidth } from "@/hooks/use-viewport";
import { fmtChange, fmtDate, fmtInt, fmtTime, hueColor } from "@/lib/format";
import type { Dashboard, DashboardRange, Kpi } from "@/lib/types";
import { useTotemStore } from "@/stores/totem-store";

const RANGES: [DashboardRange, string][] = [
  [90, "Últimos 3 meses"],
  [30, "Últimos 30 dias"],
  [7, "Últimos 7 dias"],
];

const card = "flex min-w-0 flex-col rounded-2xl border border-border bg-card";

function KpiCard({ label, kpi, line, sub, invert }: { label: string; kpi: Kpi; line: string; sub: string; invert?: boolean }) {
  const up = (kpi.changePct ?? 0) >= 0;
  const alert = invert ? up && kpi.changePct !== null && kpi.changePct > 0 : !up;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <div className={`${card} gap-4 p-[22px]`}>
      <div className="flex items-start justify-between gap-2.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className="flex h-[26px] items-center gap-[5px] rounded-full border border-input px-2.5 text-xs whitespace-nowrap"
          style={{ color: alert ? "oklch(0.82 0.13 340)" : "#fafafa" }}
        >
          {kpi.changePct !== null && <Icon className="size-[13px]" />}
          {fmtChange(kpi.changePct)}
        </span>
      </div>
      <span className="text-[34px] font-bold tracking-[-0.02em] tabular-nums">{fmtInt(kpi.value)}</span>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{line}</span>
        <span className="text-[13px] text-[#8a8a8a]">{sub}</span>
      </div>
    </div>
  );
}

function SummaryCard({ title, href, link, children }: { title: string; href: string; link: string; children: ReactNode }) {
  return (
    <div className={`${card} gap-3 p-5`}>
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[15px] font-semibold">{title}</span>
        <Link href={href} className="text-[13px] whitespace-nowrap text-muted-foreground hover:text-foreground">
          {link} →
        </Link>
      </div>
      {children}
    </div>
  );
}

function ListRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-2.5 border-t border-[#1c1c1c] py-2.5 text-sm ${onClick ? "cursor-pointer" : ""}`}>
      {children}
    </div>
  );
}

const Empty = ({ text }: { text: string }) => <div className="border-t border-[#1c1c1c] py-4 text-[13px] text-[#8a8a8a]">{text}</div>;

export function DashboardView() {
  const router = useRouter();
  const width = useViewportWidth();
  const setEventId = useTotemStore((s) => s.setEventId);
  const [range, setRange] = useState<DashboardRange>(30);
  const { data, loading } = useResource<Dashboard>(`/dashboard?range=${range}`);

  const kpiCols = width >= 760 ? "repeat(3,minmax(0,1fr))" : "minmax(0,1fr)";
  const chartCols = width >= 1100 ? "repeat(2,minmax(0,1fr))" : "minmax(0,1fr)";
  const blockCols = width >= 1200 ? "repeat(4,minmax(0,1fr))" : width >= 640 ? "repeat(2,minmax(0,1fr))" : "minmax(0,1fr)";
  const compact = width < 860;
  const maxTop = Math.max(1, ...(data?.topProducts ?? []).map((p) => p.drawn));

  const openDraw = (id: string) => {
    setEventId(id);
    router.push(`/sorteios?evento=${id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Dashboard" subtitle="Resumo dos sorteios, leads e estoque">
        <div className="flex shrink-0 overflow-hidden rounded-[10px] border border-input">
          {RANGES.map(([value, label], i) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className="flex h-9 cursor-pointer items-center px-3.5 text-[13px] whitespace-nowrap"
              style={{
                background: range === value ? "#262626" : "transparent",
                color: range === value ? "#fafafa" : "#d4d4d4",
                borderLeft: i ? "1px solid #2a2a2a" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <PrimaryButton onClick={() => router.push("/sorteios")}>Abrir sorteio</PrimaryButton>
      </PageHeader>

      {!data ? (
        <div className="py-16 text-center text-sm text-[#8a8a8a]">{loading ? "Carregando..." : "Não foi possível carregar o dashboard."}</div>
      ) : (
        <>
          <div className="grid gap-4" style={{ gridTemplateColumns: kpiCols }}>
            <KpiCard label="Sorteios realizados" kpi={data.kpis.draws} line="Comparado ao período anterior" sub={data.label} />
            <KpiCard label="Leads captados" kpi={data.kpis.leads} line="Participantes únicos" sub="Nome, e-mail, telefone e CPF" />
            <KpiCard label="Brindes em estoque" kpi={data.kpis.stock} line="Consumo no período" sub="Soma de todos os produtos" />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: chartCols }}>
            <div className={`${card} gap-4 p-[22px]`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold">Sorteios realizados</span>
                  <span className="text-[13px] text-muted-foreground">
                    {data.label} · {fmtInt(data.drawsChart.total)} sorteios
                  </span>
                </div>
                <div className="flex flex-wrap gap-3.5 text-xs text-[#d4d4d4]">
                  {data.drawsChart.series.map((s, i) => (
                    <span key={s.eventId} className="flex items-center gap-1.5">
                      <span className="size-[9px] rounded-[3px]" style={{ background: SERIES_COLORS[i] }} />
                      {s.eventName}
                    </span>
                  ))}
                </div>
              </div>
              <AreaChart series={data.drawsChart.series.map((s) => s.values)} />
              <XLabels labels={data.drawsChart.labels} compact={compact} />
            </div>
            <div className={`${card} gap-4 p-[22px]`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold">Novos leads</span>
                  <span className="text-[13px] text-muted-foreground">
                    {data.label} · {fmtInt(data.leadsChart.total)} cadastros
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-[#d4d4d4]">
                  <span className="size-[9px] rounded-[3px] bg-tyl-pink" />
                  Cadastros
                </span>
              </div>
              <BarChart values={data.leadsChart.values} />
              <XLabels labels={data.leadsChart.labels} compact={compact} />
            </div>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: blockCols }}>
            <SummaryCard title="Histórico recente" href="/leads" link="Leads">
              <div className="flex flex-col">
                {data.recent.map((h) => (
                  <ListRow key={h.id}>
                    <div className="size-2 shrink-0 rounded-full" style={{ background: hueColor(h.productHue) }} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate">{h.name}</span>
                      <span className="truncate text-xs text-[#8a8a8a]">
                        {h.productName} · {h.eventName}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#8a8a8a]">{fmtTime(h.drawnAt)}</span>
                  </ListRow>
                ))}
                {data.recent.length === 0 && <Empty text="Nenhum sorteio ainda." />}
              </div>
            </SummaryCard>
            <SummaryCard title="Estoque baixo" href="/produtos" link="Produtos">
              <div className="flex flex-col">
                {data.lowStock.map((l, i) => (
                  <ListRow key={i}>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate">{l.productName}</span>
                      <span className="truncate text-xs text-[#8a8a8a]">{l.detail}</span>
                    </div>
                    <span className="rounded-md bg-[#1f1f1f] px-2 py-[3px] font-mono text-xs whitespace-nowrap text-tyl-pink-soft">
                      {l.quantity} / {l.minStock}
                    </span>
                  </ListRow>
                ))}
                {data.lowStock.length === 0 && <Empty text="Nenhum item abaixo do mínimo." />}
              </div>
            </SummaryCard>
            <SummaryCard title="Mais sorteados" href="/produtos" link="Produtos">
              <div className="flex flex-col gap-3.5 pt-1.5">
                {data.topProducts.map((p) => (
                  <div key={p.productId} className="flex flex-col gap-1.5">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="font-mono text-muted-foreground">{p.drawn}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded bg-[#1f1f1f]">
                      <div className="h-full rounded bg-tyl-pink" style={{ width: `${Math.round((p.drawn / maxTop) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                {data.topProducts.length === 0 && <Empty text="Nenhum produto cadastrado." />}
              </div>
            </SummaryCard>
            <SummaryCard title="Eventos ativos" href="/eventos" link="Eventos">
              <div className="flex flex-col">
                {data.activeEvents.map((e) => (
                  <ListRow key={e.id} onClick={() => openDraw(e.id)}>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate">{e.name}</span>
                      <span className="text-xs text-[#8a8a8a]">
                        {fmtDate(e.date)} · {e.draws} sorteios
                      </span>
                    </div>
                    <span className="text-xs whitespace-nowrap text-tyl-pink-soft">Sortear →</span>
                  </ListRow>
                ))}
                {data.activeEvents.length === 0 && <Empty text="Nenhum evento ativo." />}
              </div>
            </SummaryCard>
          </div>
        </>
      )}
    </div>
  );
}
