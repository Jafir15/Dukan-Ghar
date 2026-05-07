# دکان گھر (Dukan Ghar)

A full-stack Urdu e-commerce & logistics web app — mobile-first, day/night mode, Noto Nastaliq Urdu font.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/dukan-ghar run dev` — run the React frontend (port 19785)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui + wouter + TanStack Query
- API: Express 5 at `/api`
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Font: Noto Nastaliq Urdu (Google Fonts)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-zod/src/index.ts` — ONLY exports `export * from "./generated/api"` (do not add extras)
- `lib/api-client-react/src/generated/api.ts` — all React Query hooks (auto-generated)
- `artifacts/api-server/src/routes/` — Express route files
- `artifacts/dukan-ghar/src/pages/` — all frontend pages
- `artifacts/dukan-ghar/src/components/` — layout, cart context, theme provider
- `artifacts/dukan-ghar/src/index.css` — full theme (saffron/emerald light, dark/gold night)
- `packages/db/src/schema/` — Drizzle ORM schema files

## Architecture decisions

- Contract-first: OpenAPI spec drives all API types and hooks via Orval codegen
- Cart stored in localStorage (`dg_cart`), session ID in `dg_session_id`
- Delivery charge formula: ≤8kg = Rs. 50, >8kg = Rs. 50 + Rs.10/extra kg
- Admin panel at hidden path `/admin/secure-panel`, default PIN: 1234
- Admin token stored in `sessionStorage` (not localStorage) for security

## Product

- **Home** — category grid, featured products, track order quick action
- **Products** (`/products`) — searchable product list with add-to-cart
- **Category** (`/category/:id`) — category-filtered products
- **Cart** (`/cart`) — cart management, delivery slot selection (7AM/11AM/4PM), order placement
- **Orders** (`/orders`) — view session orders, track by number
- **Track** (`/track/:trackingNumber`) — live order status stepper
- **Transport** (`/transport`) — vehicle booking (rickshaw, chingchi, carry bolan, car, high roof, bus)
- **Admin** (`/admin/secure-panel`) — PIN-protected dashboard: orders, products, categories, vehicles, bookings, payments

## User preferences

- Admin email: jafir0691824@gmail.com
- Admin PIN: 1234
- App theme: saffron/emerald day mode, dark/gold night mode
- Max width: 430px (mobile-first centered layout)
- Language: Urdu (Noto Nastaliq Urdu font for `.urdu-text` class)

## Gotchas

- After running `pnpm --filter @workspace/api-spec run codegen`, always ensure `lib/api-zod/src/index.ts` ONLY has `export * from "./generated/api"` — Orval may regenerate it with broken extras.
- Do NOT run `pnpm dev` or `pnpm run dev` at workspace root.
- When adding API routes, also add them to `lib/api-spec/openapi.yaml` and re-run codegen.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
