"use client";

import { ImagePlus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api";
import { uploadImage, type UploadedMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Área de envio de imagem do design (tracejada, com "Trocar imagem" quando preenchida). */
export function ImageDrop({
  url,
  onUploaded,
  title,
  hint = "PNG, JPG ou WEBP",
  height = 150,
  accept = "image/png,image/jpeg,image/webp",
  className,
}: {
  url: string | null;
  onUploaded: (media: UploadedMedia) => void;
  title: string;
  hint?: string;
  height?: number;
  accept?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed",
        url ? "border-input" : "border-[#333333]",
        className,
      )}
      style={{
        height,
        background: url
          ? `center/cover no-repeat url("${url}")`
          : "repeating-linear-gradient(135deg,#111111 0 10px,#151515 10px 20px)",
      }}
    >
      {!url && (
        <>
          <ImagePlus className="size-[22px] opacity-60" />
          <span className="text-[13px] text-muted-foreground">{busy ? "Enviando..." : title}</span>
          <span className="text-xs text-[#737373]">{hint}</span>
        </>
      )}
      {url && (
        <span className="absolute right-2.5 bottom-2.5 flex h-[30px] items-center gap-1.5 rounded-lg border border-input bg-black/70 px-2.5 text-xs">
          <RefreshCw className="size-3" /> {busy ? "Enviando..." : "Trocar imagem"}
        </span>
      )}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onUploaded(await uploadImage(file));
          } catch (err) {
            toast.error(errorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      />
    </label>
  );
}
