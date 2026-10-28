import { ApiError, API_URL } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export type UploadedMedia = { id: string; url: string; contentType: string; size: number };

/** Envia uma imagem (PNG, JPG, WEBP ou SVG até 5 MB) para `POST /media`. */
export async function uploadImage(file: File): Promise<UploadedMedia> {
  const token = useAuthStore.getState().token;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/media`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  }).catch(() => {
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new ApiError(res.status, payload?.message ?? "Falha ao enviar a imagem.");
  }
  return res.json();
}
