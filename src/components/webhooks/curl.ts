import type { HttpMethod, KeyValue } from "@/lib/types";

export type ParsedCurl = { method?: HttpMethod; url?: string; params?: KeyValue[]; headers?: KeyValue[]; body?: string };

/** Extrai método, URL, query params, headers e body de um comando cURL (mesmo algoritmo do protótipo). */
export function parseCurl(txt: string): ParsedCurl {
  const t = txt.replace(/\\\r?\n/g, " ");
  const out: ParsedCurl = {};
  const mm = t.match(/(?:-X|--request)\s+['"]?(\w+)/);
  if (mm) out.method = mm[1].toUpperCase() as HttpMethod;
  const um = t.match(/['"]?(https?:\/\/[^\s'"]+)/);
  if (um) {
    const [base, qs] = um[1].split("?");
    out.url = base;
    out.params = qs
      ? qs.split("&").map((kv) => {
          const [k, ...v] = kv.split("=");
          return { k: decodeURIComponent(k), v: decodeURIComponent(v.join("=")) };
        })
      : [];
  }
  const hs = [...t.matchAll(/(?:-H|--header)\s+(['"])(.*?)\1/g)].map((x) => {
    const i = x[2].indexOf(":");
    return { k: x[2].slice(0, i).trim(), v: x[2].slice(i + 1).trim() };
  });
  if (hs.length) out.headers = hs;
  const dm = t.match(/(?:--data-raw|--data|-d)\s+(['"])([\s\S]*?)\1(?=\s+-|\s*$)/);
  if (dm) {
    let b = dm[2];
    try {
      b = JSON.stringify(JSON.parse(b), null, 2);
    } catch {
      // body não é JSON: mantém como texto
    }
    out.body = b;
    if (!out.method) out.method = "POST";
  }
  return out;
}
