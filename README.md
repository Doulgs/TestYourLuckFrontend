# TestYourLuck — Frontend

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · Zustand · React Hook Form + Zod · tailwind-merge.

## Executando

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:9090/api
npm install
npm run dev                  # http://localhost:4000
```

O backend precisa estar rodando (veja `../backend/README.md`).

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |

## Variáveis

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:9090/api` | URL base da API |

## Estrutura

```
src/
├── app/
│   ├── (auth)/login, (auth)/cadastro          # telas públicas (fundo + formulário)
│   └── (app)/dashboard, sorteios, sorteios/jogar, leads,
│       eventos, categorias, produtos,          # painel autenticado (SessionGuard + AppShell)
│       campos-personalizados, webhooks
│       (estoque → /produtos e sorteio → /sorteios são redirecionamentos)
├── components/
│   ├── ui/              # shadcn/ui
│   ├── common/          # ModalShell, RowMenu ("…"), EventMultiSelect, ImageDrop, Toggle, tabela em grid
│   ├── layout/          # sidebar (Visão geral, Cadastros, Integrações), menu do usuário, breadcrumb
│   ├── machine/         # configuração da máquina, pré-visualização, estilos (caça-níquel, roleta,
│   │                    # slider, blocos), formulário de cadastro e resultado
│   ├── webhooks/        # editor de template com autocomplete @, headers/params, importação de cURL
│   └── <domínio>/       # views e formulários de cada página
├── hooks/               # useResource, useGameSession (créditos/jogadas), sons, viewport, sessão
├── lib/                 # cliente da API, upload de mídia, tipos, máscaras/formatadores, schemas zod
└── stores/              # zustand: sessão (persistida), UI (sidebar), evento selecionado
```

- Sessão JWT persistida em `localStorage` (`tyl-auth`); respostas 401 encerram a sessão.
- O prêmio, os créditos e os bloqueios do evento são decididos pelo servidor; o cliente só anima.
- A configuração da máquina é salva automaticamente (debounce) em `PUT /draw-settings`.
- Contrato da API: [`../backend/docs/api-contract.md`](../backend/docs/api-contract.md).
