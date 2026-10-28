"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataRow, DataTable, EmptyRow } from "@/components/common/data-table";
import { AppSelect } from "@/components/common/modal-select";
import { PageHeader } from "@/components/common/page-header";
import { ProductGlyph } from "@/components/common/product-glyph";
import { RowMenu } from "@/components/common/row-menu";
import { PrimaryButton, SearchInput } from "@/components/common/toolbar";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { useResource } from "@/hooks/use-resource";
import { api, errorMessage } from "@/lib/api";
import { STOCK_STATUS } from "@/lib/format";
import type { Category, Product, TylEvent } from "@/lib/types";

const COLS = "2fr .9fr 1fr 1.4fr 1.5fr .7fr .7fr 44px";
const ALL = "all";

function eventsText(p: Product, events: TylEvent[]): { text: string; title: string } {
  const names = events.filter((e) => p.eventIds.includes(e.id)).map((e) => e.name);
  const title = names.join(", ");
  if (!names.length) return { text: "Nenhum", title };
  if (events.length > 0 && names.length === events.length) return { text: "Todos os eventos", title };
  return { text: names.length <= 2 ? title : `${names.length} eventos`, title };
}

export function ProductsView() {
  const { data, loading, reload } = useResource<Product[]>("/products");
  const { data: categories } = useResource<Category[]>("/categories");
  const { data: events } = useResource<TylEvent[]>("/events");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [ev, setEv] = useState(ALL);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (p) =>
        (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) &&
        (cat === ALL || p.categoryId === cat) &&
        (ev === ALL || p.eventIds.includes(ev)),
    );
  }, [data, q, cat, ev]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Produtos" subtitle="O peso define a chance de cada brinde sair no sorteio">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto..." className="max-w-[340px] flex-[1_1_200px]" />
        <div className="min-w-[170px]">
          <AppSelect size="toolbar" value={cat} onChange={setCat} options={[{ value: ALL, label: "Todas as categorias" }, ...(categories ?? []).map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
        <div className="min-w-[170px]">
          <AppSelect size="toolbar" value={ev} onChange={setEv} options={[{ value: ALL, label: "Todos os eventos" }, ...(events ?? []).map((e) => ({ value: e.id, label: e.name }))]} />
        </div>
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Novo produto
        </PrimaryButton>
      </PageHeader>

      <DataTable
        variant="strong"
        columns={COLS}
        minWidth={980}
        headers={["Produto", "SKU", "Categoria", "Eventos", "Peso no sorteio", "Chance", "Estoque", ""]}
      >
        {rows.map((p) => {
          const evt = eventsText(p, events ?? []);
          const st = STOCK_STATUS[p.stockStatus];
          return (
            <DataRow key={p.id} columns={COLS} variant="strong">
              <div className="flex min-w-0 items-center gap-2.5">
                <ProductGlyph short={p.short} hue={p.hue} imageUrl={p.imageUrl} />
                <span className="font-medium">{p.name}</span>
              </div>
              <span className="font-mono text-[13px] text-muted-foreground">{p.sku}</span>
              <span>
                <span className="rounded-full border border-input px-2.5 py-[3px] text-xs whitespace-nowrap text-[#d4d4d4]">{p.categoryName ?? "—"}</span>
              </span>
              <span className="truncate text-[13px] text-[#d4d4d4]" title={evt.title}>
                {evt.text}
              </span>
              <div className="flex items-center gap-2.5">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1f1f1f]">
                  <div className="h-full rounded-full bg-tyl-pink" style={{ width: `${p.weight}%` }} />
                </div>
                <span className="w-[26px] text-right font-mono text-xs">{p.weight}</span>
              </div>
              <span className="font-mono text-[13px] text-[#d4d4d4]">{p.chance.toFixed(1)}%</span>
              <div className="flex flex-col gap-[3px]">
                <span className="font-mono">{p.quantity}</span>
                <span className="text-[11px]" style={{ color: st.fg }}>
                  {st.label}
                </span>
              </div>
              <RowMenu
                items={[
                  {
                    label: "Editar",
                    icon: Pencil,
                    onSelect: () => {
                      setEditing(p);
                      setFormOpen(true);
                    },
                  },
                  { label: "Excluir", icon: Trash2, danger: true, onSelect: () => setDeleting(p) },
                ]}
              />
            </DataRow>
          );
        })}
        {rows.length === 0 && <EmptyRow loading={loading} message={q || cat !== ALL || ev !== ALL ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."} />}
      </DataTable>
      <p className="text-[13px] text-[#8a8a8a]">
        Chance = peso do produto ÷ soma dos pesos. No sorteio, produtos sem estoque no evento ficam de fora e as chances são recalculadas.
      </p>

      <ProductFormDialog
        product={editing}
        products={data ?? []}
        categories={categories ?? []}
        events={events ?? []}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={reload}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir produto"
        description={`"${deleting?.name}" sairá do catálogo e do sorteio. O histórico de leads será preservado.`}
        onConfirm={async () => {
          try {
            await api.delete(`/products/${deleting!.id}`);
            toast.success("Produto excluído");
            await reload();
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </div>
  );
}
