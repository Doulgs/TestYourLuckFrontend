import { redirect } from "next/navigation";

export const instant = false;

// A tela Estoque foi removida: o estoque agora é do produto.
export default function EstoqueRedirect() {
  redirect("/produtos");
}
