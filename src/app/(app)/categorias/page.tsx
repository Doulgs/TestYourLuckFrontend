import type { Metadata } from "next";
import { CategoriesView } from "@/components/categories/categories-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriasPage() {
  return <CategoriesView />;
}
