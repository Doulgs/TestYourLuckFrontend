"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { ChanceBar } from "@/components/common/chance-bar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataRow, DataTable, EmptyRow } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { RowMenu } from "@/components/common/row-menu";
import { PrimaryButton, SearchInput } from "@/components/common/toolbar";
import { useResource } from "@/hooks/use-resource";
import { api, errorMessage } from "@/lib/api";
import type { Category } from "@/lib/types";

const COLS = "1.8fr 2fr .7fr .8fr 1.4fr 1.1fr";

export function CategoriesView() {
  const { data, loading, reload } = useResource<Category[]>("/categories");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((c) => !term || c.name.toLowerCase().includes(term));
  }, [data, q]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Categorias" subtitle="Agrupe os brindes para organizar o catálogo">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar categoria..." />
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Nova categoria
        </PrimaryButton>
      </PageHeader>

      <DataTable variant="strong" columns={COLS} minWidth={760} headers={["Categoria", "Produtos", "Itens", "Estoque", "Chance somada", ""]}>
        {rows.map((c) => (
          <DataRow key={c.id} columns={COLS} variant="strong">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-[#8a8a8a]">{c.description || "—"}</span>
            </div>
            <span className="text-[13px] text-[#d4d4d4]">{c.productNames.join(", ") || "—"}</span>
            <span className="font-mono">{c.productCount}</span>
            <span className="font-mono">{c.stock}</span>
            <ChanceBar pct={c.chance} color="var(--tyl-pink)" labelWidth={46} />
            <RowMenu
              items={[
                {
                  label: "Editar",
                  icon: Pencil,
                  onSelect: () => {
                    setEditing(c);
                    setFormOpen(true);
                  },
                },
                { label: "Excluir", icon: Trash2, danger: true, onSelect: () => setDeleting(c) },
              ]}
            />
          </DataRow>
        ))}
        {rows.length === 0 && <EmptyRow loading={loading} message={q ? "Nenhuma categoria encontrada." : "Nenhuma categoria cadastrada."} />}
      </DataTable>

      <CategoryFormDialog category={editing} open={formOpen} onOpenChange={setFormOpen} onSaved={reload} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir categoria"
        description={`Deseja excluir a categoria "${deleting?.name}"?`}
        onConfirm={async () => {
          try {
            await api.delete(`/categories/${deleting!.id}`);
            toast.success("Categoria excluída");
            await reload();
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </div>
  );
}
