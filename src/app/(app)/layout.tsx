import { AppShell } from "@/components/layout/app-shell";
import { SessionGuard } from "@/components/layout/session-guard";

// O painel depende da sessão salva no navegador e é renderizado no cliente;
// não há shell estático a validar para navegação instantânea.
export const instant = false;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <SessionGuard>
      <AppShell>{children}</AppShell>
    </SessionGuard>
  );
}
