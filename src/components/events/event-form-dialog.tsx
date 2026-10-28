"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Globe } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ImageDrop } from "@/components/common/image-drop";
import { AppSelect } from "@/components/common/modal-select";
import { MField, MGrid, MSwitchRow, ModalShell, mInputClass } from "@/components/common/modal-shell";
import { Toggle } from "@/components/common/toggle";
import { ApiError, api, errorMessage } from "@/lib/api";
import { EVENT_STATUS, REGIONS, TIMEZONES, UFS, hhmm, maskCep } from "@/lib/format";
import type { EventStatus, TylEvent } from "@/lib/types";
import { eventSchema, type EventValues } from "@/lib/validation";

const STATUS_OPTIONS = (["ATIVO", "RASCUNHO", "ENCERRADO"] as EventStatus[]).map((s) => ({ value: s, label: EVENT_STATUS[s].label }));
const NONE = "none";
const UF_OPTIONS = [{ value: NONE, label: "Selecione" }, ...UFS.map(([v, n]) => ({ value: v, label: `${v} — ${n}` }))];
const REGION_OPTIONS = [{ value: NONE, label: "Selecione" }, ...REGIONS.map((r) => ({ value: r, label: r }))];
const TZ_OPTIONS = TIMEZONES.map(([value, label]) => ({ value, label }));

function defaults(e: TylEvent | null): EventValues {
  return {
    name: e?.name ?? "",
    status: e?.status ?? "RASCUNHO",
    startDate: e?.startDate ?? "",
    endDate: e?.endDate ?? "",
    allDay: e?.allDay ?? true,
    startTime: hhmm(e?.startTime) || "09:00",
    endTime: hhmm(e?.endTime) || "18:00",
    allowOutside: e?.allowOutside ?? false,
    place: e?.place ?? "",
    cep: e?.cep ?? "",
    city: e?.city ?? "",
    uf: e?.uf ?? "",
    region: e?.region ?? "",
    timezone: e?.timezone ?? "America/Sao_Paulo",
    maxDraws: String(e?.maxDraws ?? 0),
    website: e?.website ?? "",
    bannerMediaId: e?.bannerMediaId ?? null,
    bannerUrl: e?.bannerUrl ?? null,
  };
}

const Divider = () => <div className="h-px bg-[#1f1f1f]" />;

export function EventFormDialog({
  event,
  open,
  onOpenChange,
  onSaved,
}: {
  event: TylEvent | null;
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
  } = useForm<EventValues>({ resolver: zodResolver(eventSchema), defaultValues: defaults(null) });

  useEffect(() => {
    if (open) reset(defaults(event));
  }, [open, event, reset]);

  const allDay = useWatch({ control, name: "allDay" });
  const maxDraws = Number(useWatch({ control, name: "maxDraws" })) || 0;
  const bannerUrl = useWatch({ control, name: "bannerUrl" });

  const submit = handleSubmit(async (v) => {
    const body = {
      name: v.name,
      status: v.status,
      startDate: v.startDate || null,
      endDate: v.endDate || null,
      allDay: v.allDay,
      startTime: v.allDay ? null : v.startTime || null,
      endTime: v.allDay ? null : v.endTime || null,
      allowOutside: v.allowOutside,
      place: v.place || null,
      cep: v.cep || null,
      city: v.city || null,
      uf: v.uf || null,
      region: v.region || null,
      timezone: v.timezone,
      maxDraws: Number(v.maxDraws || 0),
      website: v.website || null,
      bannerMediaId: v.bannerMediaId,
    };
    try {
      if (event) await api.put(`/events/${event.id}`, body);
      else await api.post("/events", body);
      toast.success(event ? "Evento atualizado" : "Evento criado");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        Object.entries(err.errors).forEach(([f, message]) => setError(f as keyof EventValues, { message }));
      }
      toast.error(errorMessage(err));
    }
  });

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={CalendarDays}
      title={event ? "Editar evento" : "Novo evento"}
      subtitle="Período, localização, banner e regras de sorteio do evento"
      onSubmit={submit}
      submitting={isSubmitting}
    >
      <div className="flex flex-col gap-4">
        <MField label="Banner do evento">
          <ImageDrop
            url={bannerUrl}
            title="Enviar banner (recomendado 1600 × 600)"
            onUploaded={(m) => {
              setValue("bannerMediaId", m.id);
              setValue("bannerUrl", m.url);
            }}
          />
        </MField>
        <MGrid>
          <MField label="Nome do evento" error={errors.name?.message}>
            <input className={mInputClass} placeholder="Ex.: Expo Tech 2026" aria-invalid={!!errors.name} {...register("name")} />
          </MField>
          <MField label="Status">
            <Controller control={control} name="status" render={({ field }) => <AppSelect value={field.value} onChange={field.onChange} options={STATUS_OPTIONS} className="bg-[#141414]! dark:bg-[#141414]!" />} />
          </MField>
        </MGrid>
        <MGrid>
          <MField label="Data de início">
            <input type="date" className={`${mInputClass} [color-scheme:dark]`} {...register("startDate")} />
          </MField>
          <MField label="Data de fim" error={errors.endDate?.message}>
            <input type="date" className={`${mInputClass} [color-scheme:dark]`} aria-invalid={!!errors.endDate} {...register("endDate")} />
          </MField>
        </MGrid>
        <Controller
          control={control}
          name="allDay"
          render={({ field }) => (
            <MSwitchRow label="Dia todo" sub="Sem horário definido de início e fim" control={<Toggle checked={field.value} onChange={field.onChange} label="Dia todo" />} />
          )}
        />
        {!allDay && (
          <MGrid>
            <MField label="Hora de início">
              <input type="time" className={`${mInputClass} [color-scheme:dark]`} {...register("startTime")} />
            </MField>
            <MField label="Hora de fim">
              <input type="time" className={`${mInputClass} [color-scheme:dark]`} {...register("endTime")} />
            </MField>
          </MGrid>
        )}
        <Controller
          control={control}
          name="allowOutside"
          render={({ field }) => (
            <MSwitchRow
              label="Permitir sorteios fora da data do evento"
              sub="Se desligado, a máquina bloqueia jogadas fora do período"
              control={<Toggle checked={field.value} onChange={field.onChange} label="Permitir sorteios fora da data" />}
            />
          )}
        />
        <Divider />
        <MField label="Local">
          <input className={mInputClass} placeholder="Ex.: São Paulo Expo — Pavilhão 4" {...register("place")} />
        </MField>
        <MGrid>
          <MField label="CEP" error={errors.cep?.message}>
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <input className={mInputClass} inputMode="numeric" placeholder="00000-000" value={field.value} onChange={(e) => field.onChange(maskCep(e.target.value))} />
              )}
            />
          </MField>
          <MField label="Cidade">
            <input className={mInputClass} placeholder="Cidade" {...register("city")} />
          </MField>
        </MGrid>
        <MGrid>
          <MField label="Estado">
            <Controller
              control={control}
              name="uf"
              render={({ field }) => (
                <AppSelect
                  value={field.value || NONE}
                  options={UF_OPTIONS}
                  className="bg-[#141414]! dark:bg-[#141414]!"
                  onChange={(v) => {
                    const uf = v === NONE ? "" : v;
                    field.onChange(uf);
                    const region = UFS.find((u) => u[0] === uf)?.[2];
                    if (region) setValue("region", region);
                  }}
                />
              )}
            />
          </MField>
          <MField label="Região">
            <Controller
              control={control}
              name="region"
              render={({ field }) => (
                <AppSelect value={field.value || NONE} options={REGION_OPTIONS} className="bg-[#141414]! dark:bg-[#141414]!" onChange={(v) => field.onChange(v === NONE ? "" : v)} />
              )}
            />
          </MField>
        </MGrid>
        <Divider />
        <MGrid>
          <MField label="Timezone">
            <Controller control={control} name="timezone" render={({ field }) => <AppSelect value={field.value} onChange={field.onChange} options={TZ_OPTIONS} className="bg-[#141414]! dark:bg-[#141414]!" />} />
          </MField>
          <MField
            label="Sorteios disponíveis"
            error={errors.maxDraws?.message}
            hint={maxDraws > 0 ? `Limite de ${maxDraws} sorteios neste evento` : "0 = sorteios ilimitados"}
          >
            <input className={`${mInputClass} font-mono`} inputMode="numeric" placeholder="0" aria-invalid={!!errors.maxDraws} {...register("maxDraws")} />
          </MField>
        </MGrid>
        <MField label="Website">
          <div className="flex h-10 items-center gap-2.5 rounded-[10px] border border-input bg-[#141414] px-3 focus-within:border-ring">
            <Globe className="size-4 shrink-0 opacity-60" />
            <input className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#737373]" placeholder="https://www.evento.com.br" {...register("website")} />
          </div>
        </MField>
      </div>
    </ModalShell>
  );
}
