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
| `/scan` | Camera barcode scanner |
| `/product/[gtin]` | Public SEO product page |
| `/login` `/register` `/forgot-password` `/reset-password` `/verify-email` | Auth |
| `/organisation/setup` | Manufacturer / distributor / retailer wizard |
| `/organisation` | Company profile and team |
| `/dashboard` | Manufacturer workspace |
| `/admin` | Super-admin workspace |
| `/developers` | API documentation |
| `/api/v1/products/{gtin}` | Public product API |
| `/api/auth/*` | Auth.js handlers |

### Database

Prisma models cover the full registry: users, organisations, brands, manufacturers, products, translations, barcodes, measurements, ingredients, allergens, nutrition, images, certifications, packaging, claims, reports, recalls, API keys, usage, subscriptions and audit logs. UUID primary keys. Unique constraint on barcode values. Indexes on GTIN, names, brand, manufacturer, organisation, status and created date.

Official GS1 numbers are **never generated**. Manufacturers supply authorised GTINs. Products without a GTIN receive an internal id such as `GPR-00000000001`, labelled as not a GS1 number.

## Local setup

Requires Node.js 20.19+ (20.14 works for development with engine warnings) and Docker for PostgreSQL.

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

PostgreSQL is published on **5433** so it does not collide with other local databases. The connection string in `.env.example` already uses that port.

5. Run Prisma migrations.

```bash
npx prisma migrate dev --name init
```

6. Seed the database.

```bash
npm run db:seed
```

7. Start the development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
npm run db:migrate   # Prisma migrate
npm run db:seed      # Seed reference + demo data
```

## Docker

```bash
docker compose up --build
```

The `web` service expects migrations to have been applied (run `prisma migrate deploy` against the same database, or use the local migrate step above).

## Security notes

- Passwords are hashed with bcrypt (12 rounds).
- API keys are stored hashed (SHA-256); the raw key is shown once when issued.
- Server actions validate with Zod and enforce role checks.
- A manufacturer cannot edit another organisation's products (`canEditOrganisationProducts`).
- Login, register and public API routes are rate-limited.
- Company status starts at `PENDING_VERIFICATION`.
