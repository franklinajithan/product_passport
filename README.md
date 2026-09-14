# Global Product Registry

A manufacturer-controlled product identity platform. Companies register once, publish verified multilingual product data, and make it available to retailers, POS systems, ecommerce sites and consumers through a public API.

This repository currently ships **Phase 1**: architecture, database, authentication, organisation onboarding, manufacturer and admin dashboards, seed data, and a working public product lookup.

## Architecture

```
src/
  app/                 Next.js App Router (pages + REST handlers)
  authentication/      Auth.js config, sessions, permissions
  components/          Shared UI (shadcn-style primitives, layout, marketing)
  database/            Prisma client
  features/            Domain UI + server actions (auth, organisation, admin, search)
  hooks/               Client hooks
  services/            Server-side business logic
  types/               Shared TypeScript types
  utilities/           GTIN helpers, crypto, formatting, rate limits
  validation/          Zod schemas
prisma/                Schema and seed
```

HTTP stays in `src/app/api`. Domain logic stays in `services`. UI for a domain stays in `features`. That split is what makes GraphQL a later addition rather than a rewrite.

### Main routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing homepage + barcode search |
| `/search` | Global product search |
| `/validate` | Identifier validation (format, check digit, registry, ownership) |
| `/scan` | Camera barcode scanner |
| `/product/[gtin]` | Public SEO product page |
| `/01/[gtin]` | GS1 Digital Link resolver |
| `/admin/standards` | Versioned standards reference (algorithms are not editable) |
| `/login` `/register` `/forgot-password` `/reset-password` `/verify-email` | Auth |
| `/organisation/setup` | Manufacturer / distributor / retailer wizard |
| `/organisation` | Company profile and team |
| `/dashboard` | Manufacturer workspace |
| `/admin` | Super-admin workspace |
| `/developers` | API documentation |
| `/api/v1/products/{gtin}` | Public product API |
| `/api/v1/gtins/{gtin}` | GTIN lookup and verification |
| `/api/v1/barcodes/validate` | Check-digit and structure validation |
| `/api/v1/barcodes/render` | Barcode symbol rendering (SVG/PNG) |
| `/api/v1/barcodes/scan` | Decode GS1 payloads then look up the product |
| `/api/auth/*` | Auth.js handlers |

### Database

Prisma models cover the full registry: users, organisations, brands, manufacturers, products, translations, barcodes, measurements, ingredients, allergens, nutrition, images, certifications, packaging, claims, reports, recalls, API keys, usage, subscriptions and audit logs. UUID primary keys. Unique constraint on barcode values. Indexes on GTIN, names, brand, manufacturer, organisation, status and created date.

Official GS1 numbers are **never generated**. The platform validates GTINs, stores allocated identifiers, and generates barcode *symbols* from valid GTINs. A valid check digit is not the same as official ownership.

Standards logic lives in `src/lib/standards` and is framework-independent.

## Local setup

Requires Node.js 20.19+ (20.14 works for development with engine warnings) and a [Supabase](https://supabase.com) Postgres database.

1. Clone the project.

```bash
cd global-product-registry
```

2. Install dependencies.

```bash
npm install
```

3. Configure environment variables.

```bash
cp .env.example .env
```

Set `AUTH_SECRET` to a long random string before going anywhere near production.

This project uses the Supabase project **Product_Passport** (`lzqnefduulkcprhqlujv`). In the Supabase dashboard open **Connect → ORMs → Prisma** and paste the Transaction pooler string into `DATABASE_URL` and the Session pooler string into `DIRECT_URL`. Keep `pgbouncer=true` and `sslmode=require` on `DATABASE_URL`.

4. Apply Prisma migrations to Supabase.

```bash
npm run db:deploy
```

5. Seed the database.

```bash
npm run db:seed
```

6. Start the development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: a local Postgres container is still available with `docker compose --profile local-db up postgres`. Point `DATABASE_URL` and `DIRECT_URL` at `postgresql://gpr:gpr@localhost:5433/gpr?schema=public` if you use it.

### Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `admin@globalproductregistry.com` | `ChangeMe_Admin_123!` |
| Verified manufacturer | `manufacturer@example.com` | `Manufacturer_123!` |
| Pending manufacturer | `pending@example.com` | `PendingCo_123!` |

Seeded product: Extra Butter, GTIN `5901234567893`.

In local development, verification and password-reset emails are printed to the server console.

## Scripts

```bash
npm run dev          # Next.js dev server
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run test         # Vitest (GTIN, completeness, permissions)
npm run db:deploy    # Apply Prisma migrations to Supabase
npm run db:migrate   # Prisma migrate (local/dev only)
npm run db:seed      # Seed reference + demo data
```

## Docker

```bash
docker compose up --build
```

The `web` service reads `DATABASE_URL` from `.env` (Supabase). Apply schema changes with `npm run db:deploy` against that same database before starting the container.

## Security notes

- Passwords are hashed with bcrypt (12 rounds).
- API keys are stored hashed (SHA-256); the raw key is shown once when issued.
- Server actions validate with Zod and enforce role checks.
- A manufacturer cannot edit another organisation's products (`canEditOrganisationProducts`).
- Login, register and public API routes are rate-limited.
- Company status starts at `PENDING_VERIFICATION`.
