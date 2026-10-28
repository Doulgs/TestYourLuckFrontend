"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Tags } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MField, ModalShell, mInputClass } from "@/components/common/modal-shell";
import { ApiError, api, errorMessage } from "@/lib/api";
import type { Category } from "@/lib/types";
import { categorySchema, type CategoryValues } from "@/lib/validation";

export function CategoryFormDialog({
  category,
  open,
  onOpenChange,
  onSaved,
}: {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({ resolver: zodResolver(categorySchema) });

  useEffect(() => {
    if (open) reset({ name: category?.name ?? "", description: category?.description ?? "" });
  }, [open, category, reset]);

  const submit = handleSubmit(async (v) => {
    const body = { name: v.name, description: v.description || null };
    try {
      if (category) await api.put(`/categories/${category.id}`, body);
      else await api.post("/categories", body);
      toast.success(category ? "Categoria atualizada" : "Categoria criada");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setError("name", { message: err.message });
      toast.error(errorMessage(err));
    }
  });

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={Tags}
      title={category ? "Editar categoria" : "Nova categoria"}
      subtitle="Agrupe brindes para filtrar e organizar o catálogo"
      maxWidth={560}
      onSubmit={submit}
      submitting={isSubmitting}
    >
      <div className="flex flex-col gap-4">
        <MField label="Nome" error={errors.name?.message}>
          <input className={mInputClass} placeholder="Ex.: Eletrônicos" aria-invalid={!!errors.name} {...register("name")} />
        </MField>
        <MField label="Descrição">
          <input className={mInputClass} placeholder="Opcional" {...register("description")} />
        </MField>
      </div>
    </ModalShell>
  );
}
