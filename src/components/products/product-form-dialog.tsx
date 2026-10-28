"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Gift } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { EventMultiSelect } from "@/components/common/event-multi-select";
import { ImageDrop } from "@/components/common/image-drop";
import { AppSelect } from "@/components/common/modal-select";
import { MField, MGrid, ModalShell, mInputClass } from "@/components/common/modal-shell";
import { ApiError, api, errorMessage } from "@/lib/api";
import type { Category, Product, TylEvent } from "@/lib/types";
import { productSchema, type ProductValues } from "@/lib/validation";

const NO_CATEGORY = "none";

export function ProductFormDialog({
  product,
  products,
  categories,
  events,
  open,
  onOpenChange,
  onSaved,
}: {
  product: Product | null;
  products: Product[];
  categories: Category[];
  events: TylEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const {
    register,
    control,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductValues>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (!open) return;
    reset({
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      categoryId: product?.categoryId ?? categories[0]?.id ?? NO_CATEGORY,
      eventIds: product?.eventIds ?? events.map((e) => e.id),
      weight: product?.weight ?? 10,
      quantity: String(product?.quantity ?? 0),
      minStock: String(product?.minStock ?? 5),
      imageMediaId: product?.imageMediaId ?? null,
      imageUrl: product?.imageUrl ?? null,
    });
  }, [open, product, categories, events, reset]);

  const weight = Number(useWatch({ control, name: "weight" })) || 0;
  const imageUrl = useWatch({ control, name: "imageUrl" });
  const others = products.filter((p) => p.id !== product?.id).reduce((a, p) => a + p.weight, 0);
  const estimated = ((weight / (others + weight || 1)) * 100).toFixed(1);

  const submit = handleSubmit(async (v) => {
    const body = {
      name: v.name,
      sku: v.sku,
      categoryId: v.categoryId === NO_CATEGORY ? null : v.categoryId,
      eventIds: v.eventIds,
      weight: v.weight,
      quantity: Number(v.quantity),
      minStock: Number(v.minStock),
      short: product?.short ?? null,
      imageMediaId: v.imageMediaId,
    };
    try {
      if (product) await api.put(`/products/${product.id}`, body);
      else await api.post("/products", body);
      toast.success(product ? "Produto atualizado" : "Produto criado");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setError("sku", { message: err.message });
      toast.error(errorMessage(err));
    }
  });

  const categoryOptions = [...categories.map((c) => ({ value: c.id, label: c.name })), { value: NO_CATEGORY, label: "Sem categoria" }];

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={Gift}
      title={product ? "Editar produto" : "Novo produto"}
      subtitle="Dados do brinde, eventos em que participa e peso no sorteio"
      maxWidth={620}
      onSubmit={submit}
      submitting={isSubmitting}
    >
      <div className="flex flex-col gap-4">
        <MField label="Imagem do produto">
          <ImageDrop
            url={imageUrl}
            height={160}
            title="Enviar foto do produto"
            onUploaded={(m) => {
              setValue("imageMediaId", m.id);
              setValue("imageUrl", m.url);
            }}
          />
        </MField>
        <MGrid>
          <MField label="Nome" error={errors.name?.message}>
            <input className={mInputClass} placeholder="Ex.: Garrafa térmica" aria-invalid={!!errors.name} {...register("name")} />
          </MField>
          <MField label="SKU" error={errors.sku?.message}>
            <input className={`${mInputClass} font-mono`} placeholder="BR-000" aria-invalid={!!errors.sku} {...register("sku")} />
          </MField>
        </MGrid>
        <MGrid>
          <MField label="Categoria">
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => <AppSelect value={field.value} onChange={field.onChange} options={categoryOptions} className="bg-[#141414]! dark:bg-[#141414]!" />}
            />
          </MField>
          <MField label="Eventos vinculados">
            <Controller control={control} name="eventIds" render={({ field }) => <EventMultiSelect events={events} value={field.value ?? []} onChange={field.onChange} />} />
          </MField>
        </MGrid>
        <div className="flex flex-col gap-2.5 rounded-xl border border-input bg-[#141414] p-4">
          <div className="flex items-baseline justify-between gap-2.5">
            <span className="text-[11px] font-semibold tracking-[0.12em] text-[#8a8a8a]">PESO NO SORTEIO</span>
            <span className="font-mono text-[22px] font-semibold">{weight}</span>
          </div>
          <Controller
            control={control}
            name="weight"
            render={({ field }) => (
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#F36ACB]"
                aria-label="Peso no sorteio"
              />
            )}
          />
          <div className="flex justify-between text-xs text-[#8a8a8a]">
            <span>0 · nunca sai</span>
            <span>
              Chance estimada: <span className="font-mono text-foreground">{estimated}%</span>
            </span>
            <span>100</span>
          </div>
        </div>
        <MGrid>
          <MField label="Quantidade em estoque" error={errors.quantity?.message}>
            <input className={`${mInputClass} font-mono`} inputMode="numeric" placeholder="0" aria-invalid={!!errors.quantity} {...register("quantity")} />
          </MField>
          <MField label="Estoque mínimo" error={errors.minStock?.message}>
            <input className={`${mInputClass} font-mono`} inputMode="numeric" placeholder="0" aria-invalid={!!errors.minStock} {...register("minStock")} />
          </MField>
        </MGrid>
      </div>
    </ModalShell>
  );
}
