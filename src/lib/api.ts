import { useAuthStore } from "@/stores/auth-store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9090/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

async function request(path: string, { body, headers, ...init }: Options = {}): Promise<Response> {
  const token = useAuthStore.getState().token;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }
  if (res.ok) return res;

  const payload = await res.json().catch(() => null);
  // Token rejeitado: encerra a sessão; o guard do layout leva ao login.
  if (res.status === 401 && token) useAuthStore.getState().logout();
  throw new ApiError(res.status, payload?.message ?? "Erro inesperado. Tente novamente.", payload?.errors);
}

export const api = {
  async get<T>(path: string): Promise<T> {
    return (await request(path)).json();
  },
  async post<T>(path: string, body?: unknown): Promise<T> {
    return (await request(path, { method: "POST", body })).json();
  },
  async put<T>(path: string, body?: unknown): Promise<T> {
    return (await request(path, { method: "PUT", body })).json();
  },
  async delete(path: string): Promise<void> {
    await request(path, { method: "DELETE" });
  },
  async download(path: string, filename: string): Promise<void> {
    const blob = await (await request(path)).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Erro inesperado. Tente novamente.";
}
