"use client";

import { ClipboardPaste } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/common/modal-shell";
import { parseCurl, type ParsedCurl } from "@/components/webhooks/curl";

export function CurlDialog({ open, onOpenChange, onImport }: { open: boolean; onOpenChange: (o: boolean) => void; onImport: (p: ParsedCurl) => void }) {
  const [text, setText] = useState("");
  return (
    <ModalShell
      open={open}
      onOpenChange={(o) => {
        if (!o) setText("");
        onOpenChange(o);
      }}
      icon={ClipboardPaste}
      title="Colar cURL"
      subtitle="Cole o comando e preenchemos método, URL, headers, params e body"
      maxWidth={640}
      submitLabel="Importar"
      onSubmit={() => {
        const p = parseCurl(text);
        if (!p.url) {
          toast.error("Não encontrei uma URL no cURL");
          return;
        }
        onImport(p);
        setText("");
        onOpenChange(false);
        toast.success("cURL importado");
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Comando cURL"
        placeholder="curl -X POST https://api.exemplo.com/v1/leads -H 'Content-Type: application/json' -d '...'"
        className="min-h-[220px] w-full resize-y rounded-xl border border-input bg-[#050505] p-3.5 font-mono text-[13px] leading-relaxed outline-none placeholder:text-[#737373] focus:border-ring"
      />
    </ModalShell>
  );
}
