# Veena — Next.js + PostgreSQL Starter

Scaffold implementing the data layer and API routes behind the Veena design
(see `../README.md` for the full design handoff). This is a **starting
structure**, not a finished app — page components are stubbed with comments
pointing at the corresponding section of the HTML prototype; UI still needs
to be built.

## Stack
- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- NextAuth (wired as a dependency; auth routes not scaffolded — add `[...nextauth]` route + provider config)
- Zod for request validation

## Getting started
```bash
npm install
cp .env.example .env        # then set DATABASE_URL to your Postgres instance
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## What's included
- `prisma/schema.prisma` — full data model: products, media, colors, variants,
  cart, orders, reviews, adjustment requests, bespoke requests, fitting
  (Try It On) requests, stores.
- `prisma/seed.ts` — seeds the 6 sample products used in the design prototype.
- `src/lib/db.ts` — Prisma client singleton.
- `src/lib/money.ts` — minor-unit currency formatting + delivery fee table.
- `src/app/api/*` — REST route handlers: products (list + detail), cart
  (get/add/update), checkout (creates an Order from the cart), orders (lookup
  by order number), adjustments, bespoke, fitting (Try It On), chat (Ask Veena).
- `src/app/*/page.tsx` — route stubs for Home, Products (PLP), Product Detail
  (PDP), Checkout, About, Legal — each commented with which prototype section
  and which components/API calls it needs.

## Not included (by design — decide with the team first)
- Payment provider integration (Paystack/Flutterwave/Stripe) — checkout route
  creates a `PENDING_PAYMENT` order only.
- Real auth flows / account pages.
- Actual product photography/video — all seeded media URLs are placeholders.
- Live "Ask Veena" AI — chat route currently serves the same scripted FAQ as
  the prototype; swap in an LLM call if you want open-ended answers.

See the top-level `README.md` for full screen-by-screen design specs, tokens,
and open questions.
