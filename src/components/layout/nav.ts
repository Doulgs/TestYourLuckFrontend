import {
  CalendarDays,
  Dices,
  Gift,
  LayoutDashboard,
  Tags,
  TextCursorInput,
  Users,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Visão geral",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/sorteios", label: "Sorteios", icon: Dices },
      { href: "/leads", label: "Leads", icon: Users },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/eventos", label: "Eventos", icon: CalendarDays },
      { href: "/categorias", label: "Categorias", icon: Tags },
      { href: "/produtos", label: "Produtos", icon: Gift },
      { href: "/campos-personalizados", label: "Campos personalizados", icon: TextCursorInput },
    ],
  },
  {
    title: "Integrações",
    items: [{ href: "/webhooks", label: "Webhooks", icon: Webhook }],
  },
];

export const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.href, i.label])),
);

/** Modo de jogo do sorteio: tela cheia, sem sidebar nem breadcrumb. */
export const TOTEM_PATHS = ["/sorteios/jogar"];
