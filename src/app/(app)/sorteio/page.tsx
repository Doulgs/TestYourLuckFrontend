import { redirect } from "next/navigation";

export const instant = false;

// Endereço antigo do totem: a configuração e o jogo agora ficam em /sorteios.
export default async function SorteioRedirect({ searchParams }: PageProps<"/sorteio">) {
  const evento = (await searchParams).evento;
  redirect(typeof evento === "string" ? `/sorteios?evento=${encodeURIComponent(evento)}` : "/sorteios");
}
