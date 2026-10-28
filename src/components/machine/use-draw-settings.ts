"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useResource } from "@/hooks/use-resource";
import { api, errorMessage } from "@/lib/api";
import type { DrawSettings } from "@/lib/machine-types";

const SAVE_DELAY = 600;

/** Configuração da máquina com alteração local imediata e salvamento automático (debounce). */
export function useDrawSettings() {
  const { data, loading } = useResource<DrawSettings>("/draw-settings");
  const [local, setLocal] = useState<DrawSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<DrawSettings | null>(null);
  const settings = local ?? data;

  const flush = useCallback(async () => {
    const next = pending.current;
    pending.current = null;
    if (!next) return;
    setSaving(true);
    try {
      const { logoUrl: _ignored, ...body } = next;
      void _ignored;
      const saved = await api.put<DrawSettings>("/draw-settings", body);
      // Mantém edições feitas durante a requisição; atualiza apenas a URL do logo vinda do servidor.
      setLocal((cur) => (cur ? { ...cur, logoUrl: saved.logoUrl } : saved));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    (patch: Partial<DrawSettings>) => {
      setLocal((cur) => {
        const base = cur ?? data;
        if (!base) return cur;
        const next = { ...base, ...patch };
        pending.current = next;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), SAVE_DELAY);
        return next;
      });
    },
    [data, flush],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (pending.current) void flush();
    },
    [flush],
  );

  return { settings, loading, saving, update };
}
