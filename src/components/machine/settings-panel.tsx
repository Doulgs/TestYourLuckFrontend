"use client";

import { Cherry, Disc3, GalleryHorizontalEnd, Grid3x3, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ImageDrop } from "@/components/common/image-drop";
import { Toggle } from "@/components/common/toggle";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DrawSettings, GameStyle, MachineField } from "@/lib/machine-types";
import { cn } from "@/lib/utils";

const STYLES: { key: GameStyle; label: string; desc: string; icon: LucideIcon }[] = [
  { key: "SLOT", label: "Caça-níquel", desc: "3 rolos com alavanca", icon: Cherry },
  { key: "WHEEL", label: "Roleta", desc: "Roda da sorte com ponteiro", icon: Disc3 },
  { key: "SLIDER", label: "Slider", desc: "Faixa de prêmios deslizando", icon: GalleryHorizontalEnd },
  { key: "BLOCKS", label: "Blocos", desc: "Revele até achar 3 iguais", icon: Grid3x3 },
];
const COLORS = ["#F36ACB", "#22D3EE", "#A3E635", "#FBBF24", "#8B5CF6"];
const TYPE_LABEL: Record<MachineField["type"], string> = { TEXT: "Texto curto", NUMBER: "Número", DATE: "Data", SELECT: "Seleção", BOOL: "Sim / Não" };

function Card({ title, small, children }: { title: string; small?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-[#0a0a0a] p-[18px]">
      <span className={small ? "text-[13px] font-medium text-[#d4d4d4]" : "text-[15px] font-semibold"}>{title}</span>
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-medium text-[#d4d4d4]">{children}</span>;
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-[3px] rounded-[10px] border border-[#262626] bg-[#111111] p-[3px]">
      {options.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-[7px] text-[13px] whitespace-nowrap"
          style={{ background: value === k ? "#262626" : "transparent", color: value === k ? "#fafafa" : "#a1a1a1" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} className="flex cursor-pointer items-center gap-3">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm">{label}</span>
        {sub && <span className="text-xs text-[#8a8a8a]">{sub}</span>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

const fieldInput = "h-10 rounded-[10px] border-input bg-[#141414] px-3 text-sm dark:bg-[#141414]";

/** Opções da máquina: evento, estilo, brand kit, máquina e participação. */
export function SettingsPanel({
  settings,
  update,
  events,
  eventId,
  onEventChange,
  fields,
  saving,
}: {
  settings: DrawSettings;
  update: (patch: Partial<DrawSettings>) => void;
  events: { id: string; name: string }[];
  eventId: string | null;
  onEventChange: (id: string) => void;
  fields: MachineField[];
  saving: boolean;
}) {
  const activeFields = fields.filter((f) => f.active);
  const color = settings.primaryColor.toUpperCase();
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Sorteios</h1>
        <p className="text-sm text-muted-foreground">
          Configure a máquina antes de abrir para os participantes
          {saving && <span className="ml-2 text-xs text-[#737373]">· salvando...</span>}
        </p>
      </div>

      <Card title="Evento" small>
        <Select value={eventId ?? ""} onValueChange={onEventChange}>
          <SelectTrigger className="h-10! w-full rounded-[10px] border-input bg-[#141414] px-3 text-sm dark:bg-[#141414]">
            <SelectValue placeholder="Selecione um evento" />
          </SelectTrigger>
          <SelectContent className="border border-input bg-[#141414] ring-0">
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card title="Estilo do jogo" small>
        <div className="grid grid-cols-2 gap-2.5">
          {STYLES.map(({ key, label, desc, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => update({ style: key })}
              className="flex cursor-pointer flex-col gap-2.5 rounded-xl p-3.5 text-left"
              style={{ background: settings.style === key ? "#161616" : "#0d0d0d", border: `1px solid ${settings.style === key ? "#F36ACB" : "#222222"}` }}
            >
              <Icon className="size-[22px]" />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs leading-snug text-[#8a8a8a]">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Brand kit">
        <div className="flex flex-col gap-2">
          <Label>Logo</Label>
          <Segmented
            value={settings.logoMode}
            options={[
              ["DEFAULT", "TestYourLuck"],
              ["CUSTOM", "Logo do cliente"],
            ]}
            onChange={(logoMode) => update({ logoMode })}
          />
          {settings.logoMode === "CUSTOM" && (
            <ImageDrop
              url={settings.logoUrl}
              height={64}
              title="Enviar imagem (PNG ou SVG)"
              hint=""
              accept="image/png,image/svg+xml"
              className="bg-contain! bg-center!"
              onUploaded={(m) => update({ logoMediaId: m.id, logoUrl: m.url })}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Cor principal</Label>
          <div className="flex flex-wrap items-center gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => update({ primaryColor: c })}
                className="size-[30px] cursor-pointer rounded-full"
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px #000, 0 0 0 4px ${c}` : "none" }}
              />
            ))}
            <input
              type="color"
              aria-label="Cor personalizada"
              value={color.toLowerCase()}
              onChange={(e) => update({ primaryColor: e.target.value.toUpperCase() })}
              className="size-[34px] cursor-pointer rounded-lg border border-input bg-[#141414] p-0"
            />
            <span className="font-mono text-xs text-muted-foreground">{color}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Fundo</Label>
          <Segmented
            value={settings.background}
            options={[
              ["PRETO", "Preto"],
              ["GRAFITE", "Grafite"],
              ["COR", "Brilho da cor"],
            ]}
            onChange={(background) => update({ background })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Título da máquina</Label>
          <Input className={fieldInput} value={settings.title} maxLength={80} onChange={(e) => update({ title: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Mensagem do prêmio</Label>
          <Input className={fieldInput} value={settings.winMessage} maxLength={160} onChange={(e) => update({ winMessage: e.target.value })} />
        </div>
      </Card>

      <Card title="Máquina">
        <div className="flex flex-col gap-2">
          <Label>Tamanho</Label>
          <Segmented
            value={settings.size}
            options={[
              ["P", "P"],
              ["M", "M"],
              ["G", "G"],
              ["F", "Tela cheia"],
            ]}
            onChange={(size) => update({ size })}
          />
        </div>
        <ToggleRow label="Efeitos de luz" sub="Luzes piscando no gabinete" checked={settings.lights} onChange={(lights) => update({ lights })} />
        <ToggleRow label="Som" sub="Efeitos sonoros ao jogar" checked={settings.sound} onChange={(sound) => update({ sound })} />
        <ToggleRow
          label="Exibir prêmios disponíveis"
          sub="Lista de brindes abaixo da máquina"
          checked={settings.showPrizes}
          onChange={(showPrizes) => update({ showPrizes })}
        />
      </Card>

      <Card title="Participação">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm">Créditos por lead</span>
            <span className="text-xs text-[#8a8a8a]">Liberados após o cadastro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Diminuir créditos"
              onClick={() => update({ credits: Math.max(1, settings.credits - 1) })}
              className="size-8 cursor-pointer rounded-lg border border-input bg-[#141414]"
            >
              −
            </button>
            <span className="w-7 text-center font-mono text-[15px]">{settings.credits}</span>
            <button
              type="button"
              aria-label="Aumentar créditos"
              onClick={() => update({ credits: Math.min(5, settings.credits + 1) })}
              className="size-8 cursor-pointer rounded-lg border border-input bg-[#141414]"
            >
              +
            </button>
          </div>
        </div>
        <div className="h-px bg-[#1c1c1c]" />
        <Label>Campos do cadastro (nome é sempre obrigatório)</Label>
        <ToggleRow label="E-mail" checked={settings.askEmail} onChange={(askEmail) => update({ askEmail })} />
        <ToggleRow label="Telefone" checked={settings.askPhone} onChange={(askPhone) => update({ askPhone })} />
        <ToggleRow label="CPF" checked={settings.askCpf} onChange={(askCpf) => update({ askCpf })} />
        <div className="h-px bg-[#1c1c1c]" />
        <div className="flex items-center justify-between gap-2.5">
          <Label>Perguntas personalizadas</Label>
          <Link href="/campos-personalizados" className="text-xs whitespace-nowrap text-muted-foreground hover:text-foreground">
            Gerenciar →
          </Link>
        </div>
        {activeFields.length === 0 && <span className="text-[13px] text-[#737373]">Nenhum campo personalizado ativo.</span>}
        {activeFields.map((f) => {
          const on = settings.customFieldIds.includes(f.id);
          const toggle = (v: boolean) =>
            update({ customFieldIds: v ? [...settings.customFieldIds, f.id] : settings.customFieldIds.filter((x) => x !== f.id) });
          return (
            <div
              key={f.id}
              onClick={() => toggle(!on)}
              className={cn("flex cursor-pointer items-center gap-3 rounded-[10px] bg-[#0d0d0d] px-3 py-2.5")}
              style={{ border: `1px solid ${on ? "#3a2433" : "#222222"}` }}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="truncate text-sm">{f.label}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#8a8a8a]">{TYPE_LABEL[f.type]}</span>
                  {f.required && <span className="rounded bg-[#1f1f1f] px-1.5 py-px text-[10px] text-[#d4d4d4]">obrigatório</span>}
                  <span className="font-mono text-[11px] text-tyl-pink">{f.token}</span>
                </div>
              </div>
              <Toggle checked={on} onChange={toggle} label={f.label} />
            </div>
          );
        })}
        <Link href="/campos-personalizados?novo=1" className="self-start text-[13px] text-tyl-pink underline underline-offset-[3px]">
          + Criar nova pergunta
        </Link>
      </Card>
    </div>
  );
}
