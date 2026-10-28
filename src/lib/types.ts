// Tipos de domínio espelhando backend/docs/api-contract.md

export type User = { id: string; name: string; email: string; company: string; initials: string };
export type AuthResponse = { token: string; user: User };

export type EventStatus = "ATIVO" | "RASCUNHO" | "ENCERRADO";
export type TylEvent = {
  id: string;
  name: string;
  status: EventStatus;
  startDate: string | null;
  endDate: string | null;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
  allowOutside: boolean;
  place: string | null;
  city: string | null;
  uf: string | null;
  region: string | null;
  cep: string | null;
  timezone: string;
  maxDraws: number;
  website: string | null;
  bannerMediaId: string | null;
  bannerUrl: string | null;
  draws: number;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  productNames: string[];
  stock: number;
  chance: number;
};

export type StockStatus = "OK" | "BAIXO" | "ESGOTADO";
export type Product = {
  id: string;
  name: string;
  short: string;
  sku: string;
  categoryId: string | null;
  categoryName: string | null;
  weight: number;
  minStock: number;
  hue: number;
  chance: number;
  quantity: number;
  stockStatus: StockStatus;
  eventIds: string[];
  imageMediaId: string | null;
  imageUrl: string | null;
  drawn: number;
};

export type FieldType = "TEXT" | "NUMBER" | "DATE" | "SELECT" | "BOOL";
export type CustomField = {
  id: string;
  label: string;
  key: string;
  token: string;
  type: FieldType;
  options: string[];
  placeholder: string | null;
  required: boolean;
  active: boolean;
};

export type WebhookTrigger = "LEAD" | "PLAY";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type KeyValue = { k: string; v: string };
export type Webhook = {
  id: string;
  name: string;
  trigger: WebhookTrigger;
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string | null;
  eventIds: string[];
  active: boolean;
  dispatchCount: number;
  lastDispatchAt: string | null;
};
export type DeliverySummary = {
  id: string;
  webhookName: string;
  ok: boolean;
  status: string;
  method: string;
  url: string;
  eventName: string | null;
  test: boolean;
  sentAt: string;
};
export type DeliveryDetail = {
  id: string;
  webhookName: string;
  trigger: WebhookTrigger;
  ok: boolean;
  status: string;
  method: string;
  url: string;
  sentAt: string;
  request: Record<string, unknown>;
  response: Record<string, unknown> | null;
};

export type WebhookStatus = "NONE" | "OK" | "ERROR";
export type Lead = {
  id: string;
  participantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  answers: Record<string, string>;
  eventId: string;
  eventName: string;
  productId: string;
  productName: string;
  productShort: string;
  productHue: number;
  drawnAt: string;
  webhookStatus: WebhookStatus;
};
export type Page<T> = { content: T[]; page: number; size: number; totalElements: number; totalPages: number };

export type DashboardRange = 7 | 30 | 90;
export type Kpi = { value: number; changePct: number | null };
export type Dashboard = {
  range: DashboardRange;
  label: string;
  kpis: { draws: Kpi; leads: Kpi; stock: Kpi };
  drawsChart: { labels: string[]; series: { eventId: string; eventName: string; values: number[] }[]; total: number };
  leadsChart: { labels: string[]; values: number[]; total: number };
  recent: { id: string; name: string; productName: string; productHue: number; eventName: string; drawnAt: string }[];
  lowStock: { productName: string; detail: string; quantity: number; minStock: number }[];
  topProducts: { productId: string; name: string; hue: number; drawn: number }[];
  activeEvents: { id: string; name: string; date: string | null; draws: number }[];
};
