"use client";

import type { LucideIcon } from "lucide-react";
import { Save, X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Modal do design v2: tile de ícone na cor principal, título + subtítulo, corpo #0b0b0b rolável
 * e rodapé com "Cancelar" e ação primária.
 */
export function ModalShell({
  open,
  onOpenChange,
  icon: Icon,
  title,
  subtitle,
  maxWidth = 760,
  headerExtra,
  footerStart,
  footerActions,
  onSubmit,
  submitLabel = "Salvar",
  submitting = false,
  hideSubmit = false,
  cancelLabel = "Cancelar",
  bodyClassName,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  maxWidth?: number;
  headerExtra?: ReactNode;
  footerStart?: ReactNode;
  /** Substitui os botões padrão (Cancelar/Salvar) do rodapé. */
  footerActions?: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  submitting?: boolean;
  hideSubmit?: boolean;
  cancelLabel?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ maxWidth }}
        className="flex max-h-[calc(100vh-40px)] w-[calc(100%-40px)] flex-col gap-0 overflow-hidden rounded-[20px] border border-[#262626] bg-[#0f0f0f] p-0 shadow-[0_30px_80px_-20px_#000] ring-0 sm:max-w-none"
      >
        <form
          noValidate
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="flex flex-wrap items-center gap-4 border-b border-[#1f1f1f] px-[22px] py-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tyl-pink">
              <Icon className="size-[22px] text-white" />
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-0.5">
              <DialogTitle className="text-[19px] font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{subtitle}</DialogDescription>
            </div>
            {headerExtra}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
              className="flex size-9 cursor-pointer items-center justify-center rounded-[10px] hover:bg-[#1c1c1c]"
            >
              <X className="size-[18px] opacity-70" />
            </button>
          </div>
          <div className={cn("min-h-0 flex-1 overflow-y-auto bg-[#0b0b0b] p-[22px]", bodyClassName)}>{children}</div>
          <div className="flex flex-wrap items-center gap-3 border-t border-[#1f1f1f] px-[22px] py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">{footerStart}</div>
            {footerActions ?? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-[42px] cursor-pointer items-center gap-1.5 px-3.5 text-sm text-[#d4d4d4] hover:text-foreground"
                >
                  <X className="size-[15px] opacity-70" />
                  {cancelLabel}
                </button>
                {!hideSubmit && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl bg-tyl-pink px-[18px] text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Save className="size-4" />
                    {submitting ? "Salvando..." : submitLabel}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Campo do ModalShell: rótulo 11px em caixa alta + controle + erro. */
export function MField({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <span className="text-[11px] font-semibold tracking-[0.12em] text-[#8a8a8a] uppercase">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-[#8a8a8a]">{hint}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

/** Grade responsiva de 2 colunas (mín. 200px) usada nos modais. */
export function MGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3.5">{children}</div>;
}

export const mInputClass =
  "h-10 w-full min-w-0 rounded-[10px] border border-input bg-[#141414] px-3 text-sm text-foreground outline-none placeholder:text-[#737373] focus:border-ring focus:shadow-[0_0_0_3px_rgba(255,255,255,.06)] aria-invalid:border-destructive";

/** Linha com rótulo à esquerda e interruptor à direita (cartão #141414). */
export function MSwitchRow({ label, sub, control }: { label: string; sub?: string; control: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-input bg-[#141414] px-3.5 py-3">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm">{label}</span>
        {sub && <span className="text-xs text-[#8a8a8a]">{sub}</span>}
      </div>
      {control}
    </div>
  );
}
