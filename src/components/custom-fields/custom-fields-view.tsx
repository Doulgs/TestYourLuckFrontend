"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomFieldDialog } from "@/components/custom-fields/custom-field-dialog";
import { FIELD_TYPE_LABELS } from "@/components/custom-fields/field-utils";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataRow, DataTable, EmptyRow } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { RowMenu } from "@/components/common/row-menu";
import { Toggle } from "@/components/common/toggle";
import { PrimaryButton, SearchInput } from "@/components/common/toolbar";
import { useResource } from "@/hooks/use-resource";
import { api, errorMessage } from "@/lib/api";
import type { CustomField } from "@/lib/types";

const COLS = "2fr 1.4fr 1fr 1.6fr .8fr .7fr 44px";

export function CustomFieldsView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { data, setData, loading, reload } = useResource<CustomField[]>("/custom-fields");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<CustomField | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<CustomField | null>(null);

  // "?novo=1" (atalho da tela de Sorteios) abre o modal de novo campo.
  const novo = params.get("novo") === "1";
  useEffect(() => {
    if (!novo) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- abertura disparada pela URL
    setEditing(null);
    setFormOpen(true);
    router.replace(pathname);
  }, [novo, router, pathname]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((f) => !term || f.label.toLowerCase().includes(term) || f.key.includes(term));
  }, [data, q]);

  const setActive = async (f: CustomField, active: boolean) => {
    setData((cur) => cur?.map((x) => (x.id === f.id ? { ...x, active } : x)) ?? cur);
    try {
      await api.put(`/custom-fields/${f.id}`, { ...f, active });
    } catch (err) {
      toast.error(errorMessage(err));
      void reload();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Campos personalizados" subtitle="Perguntas extras feitas ao participante antes de jogar">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar campo..." />
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Novo campo
        </PrimaryButton>
      </PageHeader>

      <DataTable variant="strong" columns={COLS} minWidth={900} headers={["Campo", "Variável", "Tipo", "Opções", "Obrigatório", "Ativo", ""]}>
        {rows.map((f) => (
          <DataRow key={f.id} columns={COLS} variant="strong">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium">{f.label}</span>
              <span className="text-xs text-[#8a8a8a]">{f.placeholder || "—"}</span>
            </div>
            <span>
              <span className="rounded-md bg-[#1f1f1f] px-2 py-[3px] font-mono text-xs text-tyl-pink">{f.token}</span>
            </span>
            <span className="text-[#d4d4d4]">{FIELD_TYPE_LABELS[f.type]}</span>
            <span className="truncate text-[13px] text-muted-foreground">{f.type === "SELECT" ? f.options.join(", ") : "—"}</span>
            <span className="text-[#d4d4d4]">{f.required ? "Sim" : "Não"}</span>
            <Toggle checked={f.active} onChange={(v) => setActive(f, v)} label={`Ativar ${f.label}`} />
            <RowMenu
              items={[
                {
                  label: "Editar",
                  icon: Pencil,
                  onSelect: () => {
                    setEditing(f);
                    setFormOpen(true);
                  },
                },
                { label: f.active ? "Desativar" : "Ativar", icon: f.active ? EyeOff : Eye, onSelect: () => setActive(f, !f.active) },
                { label: "Excluir", icon: Trash2, danger: true, onSelect: () => setDeleting(f) },
              ]}
            />
          </DataRow>
        ))}
        {rows.length === 0 && <EmptyRow loading={loading} message={q ? "Nenhum campo encontrado." : "Nenhum campo personalizado cadastrado."} />}
      </DataTable>
      <p className="text-[13px] text-[#8a8a8a]">Campos ativos aparecem no cadastro do sorteio e podem ser usados como variáveis nos webhooks.</p>

      <CustomFieldDialog field={editing} open={formOpen} onOpenChange={setFormOpen} onSaved={reload} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir campo"
        description={`"${deleting?.label}" sairá do cadastro do sorteio. As respostas já registradas serão preservadas.`}
        onConfirm={async () => {
          try {
            await api.delete(`/custom-fields/${deleting!.id}`);
            toast.success("Campo excluído");
            await reload();
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </div>
  );
}
