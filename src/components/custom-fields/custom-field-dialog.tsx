"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TextCursorInput, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FIELD_TYPE_LABELS, slugKey } from "@/components/custom-fields/field-utils";
import { AppSelect } from "@/components/common/modal-select";
import { MField, MGrid, MSwitchRow, ModalShell, mInputClass } from "@/components/common/modal-shell";
import { Toggle } from "@/components/common/toggle";
import { ApiError, api, errorMessage } from "@/lib/api";
import type { CustomField, FieldType } from "@/lib/types";
import { customFieldSchema, type CustomFieldValues } from "@/lib/validation";

const TYPE_OPTIONS = (Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((t) => ({ value: t, label: FIELD_TYPE_LABELS[t] }));

export function CustomFieldDialog({
  field,
  open,
  onOpenChange,
  onSaved,
}: {
  field: CustomField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [keyEdited, setKeyEdited] = useState(false);
  const {
    register,
    control,
    reset,
    setValue,
    getValues,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomFieldValues>({ resolver: zodResolver(customFieldSchema) });

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia o modo da chave ao abrir
    setKeyEdited(!!field);
    reset({
      label: field?.label ?? "",
      placeholder: field?.placeholder ?? "",
      key: field?.key ?? "",
      type: field?.type ?? "TEXT",
      options: field?.options.length ? field.options : ["", ""],
      required: field?.required ?? false,
    });
  }, [open, field, reset]);

  const type = useWatch({ control, name: "type" });
  const key = useWatch({ control, name: "key" });
  const options = useWatch({ control, name: "options" }) ?? [];

  const submit = handleSubmit(async (v) => {
    const body = {
      label: v.label,
      key: v.key,
      type: v.type,
      options: v.type === "SELECT" ? v.options.map((o) => o.trim()).filter(Boolean) : [],
      placeholder: v.placeholder || null,
      required: v.required,
      active: field?.active ?? true,
    };
    try {
      if (field) await api.put(`/custom-fields/${field.id}`, body);
      else await api.post("/custom-fields", body);
      toast.success(field ? "Campo atualizado" : "Campo criado");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.message === "Chave reservada")) setError("key", { message: err.message });
      toast.error(errorMessage(err));
    }
  });

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={TextCursorInput}
      title={field ? "Editar campo" : "Novo campo personalizado"}
      subtitle="Pergunta extra exibida antes de jogar"
      maxWidth={560}
      onSubmit={submit}
      submitting={isSubmitting}
      footerStart={
        <>
          <span className="text-[13px] text-[#8a8a8a]">Variável:</span>
          <span className="truncate font-mono text-xs text-tyl-pink">{`{{${key || "chave"}}}`}</span>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <MField label="Pergunta / rótulo" error={errors.label?.message}>
          <input
            className={mInputClass}
            placeholder="Ex.: Qual sua empresa?"
            aria-invalid={!!errors.label}
            {...register("label", {
              onChange: (e) => {
                if (!keyEdited) setValue("key", slugKey(e.target.value));
              },
            })}
          />
        </MField>
        <MField label="Texto de ajuda">
          <input className={mInputClass} placeholder="Opcional — aparece dentro do campo" {...register("placeholder")} />
        </MField>
        <MGrid>
          <MField label="Chave da variável" error={errors.key?.message}>
            <Controller
              control={control}
              name="key"
              render={({ field: f }) => (
                <input
                  className={`${mInputClass} font-mono`}
                  placeholder="empresa"
                  aria-invalid={!!errors.key}
                  value={f.value ?? ""}
                  onChange={(e) => {
                    setKeyEdited(true);
                    f.onChange(slugKey(e.target.value));
                  }}
                />
              )}
            />
          </MField>
          <MField label="Tipo">
            <Controller control={control} name="type" render={({ field: f }) => <AppSelect value={f.value} onChange={f.onChange} options={TYPE_OPTIONS} className="bg-[#141414]! dark:bg-[#141414]!" />} />
          </MField>
        </MGrid>
        {type === "SELECT" && (
          <MField label="Opções">
            <div className="flex flex-col gap-2">
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-[22px] shrink-0 text-right font-mono text-xs text-[#737373]">{i + 1}</span>
                  <input
                    className={mInputClass}
                    placeholder={`Opção ${i + 1}`}
                    value={o}
                    onChange={(e) => setValue("options", getValues("options").map((x, k) => (k === i ? e.target.value : x)))}
                  />
                  <button
                    type="button"
                    title="Remover"
                    onClick={() => setValue("options", getValues("options").filter((_, k) => k !== i))}
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-input"
                  >
                    <X className="size-3.5 opacity-60" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setValue("options", [...getValues("options"), ""])}
                className="ml-[30px] cursor-pointer self-start text-[13px] text-tyl-pink underline underline-offset-[3px]"
              >
                + Adicionar mais opções
              </button>
            </div>
          </MField>
        )}
        <Controller
          control={control}
          name="required"
          render={({ field: f }) => <MSwitchRow label="Obrigatório" control={<Toggle checked={!!f.value} onChange={f.onChange} label="Obrigatório" />} />}
        />
      </div>
    </ModalShell>
  );
}
