import type { Metadata } from "next";
import { ProductsView } from "@/components/products/products-view";

// Painel renderizado no cliente após validar a sessão (ver layout).
export const instant = false;

export const metadata: Metadata = { title: "Produtos" };

export default function ProdutosPage() {
  return <ProductsView />;
}
