# Deployment Guide — Kati Kandles

Stack: **Next.js 15 + Drizzle + Neon Postgres + Stack Auth (Neon Auth) + Stripe + Vercel Blob**.

---

## 1) Install packages

```bash
pnpm install
```

## 2) Set up Neon

1. Δημιούργησε project στο [console.neon.tech](https://console.neon.tech).
2. Πήγαινε στο **Auth** tab και ενεργοποίησε το **Neon Auth** (powered by Stack).
3. Στο **Connection** tab, αντίγραψε το `DATABASE_URL` (postgresql://…).

Πρόσθεσε στο `.env.local`:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
```

## 3) Apply the schema

Δύο τρόποι — διάλεξε:

**Drizzle Kit (πιο γρήγορο για dev):**
```bash
pnpm db:push
```

**Plain SQL (πρώτη εγκατάσταση):**
Στο Neon SQL Editor, paste & run `scripts/migrations/001_initial.sql`.

## 4) Δημιούργησε τον admin σου

a. Στο Neon Auth (μέσω Stack dashboard) → Users → Create user (email + password).
b. Σημείωσε το user `id`.
c. Στο Neon SQL Editor:

```sql
insert into admin_users (id, email, display_name, role)
values (
  'STACK_USER_ID',
  'you@example.com',
  'Antonis',
  'owner'
)
on conflict (id) do update set role = 'owner';
```

## 5) Stripe

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys → πάρε `sk_…` και `pk_…`.
2. Developers → Webhooks → Add endpoint:
   - URL: `https://YOUR-DOMAIN/api/payments/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `charge.refunded`
3. Σημείωσε το `whsec_…`.

## 6) Vercel env vars

```
NEXT_PUBLIC_SITE_URL=https://katikandles.gr

DATABASE_URL=postgresql://...
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

BLOB_READ_WRITE_TOKEN=...
```

## 7) Deploy

Push στο `main` — Vercel κάνει auto-deploy. Στο πρώτο deploy:

1. Verify ότι το build περνά (build logs).
2. Visit `/admin/login` → sign in.
3. Verify ότι βλέπεις τα stats (αν δεν έχεις data, θα είναι 0/€0).

---

## Local development

```bash
pnpm dev
```

Drizzle Studio (visual DB browser):
```bash
pnpm db:studio
```

## Schema changes flow

1. Άλλαξε `lib/db/schema.ts`.
2. `pnpm db:generate` → φτιάχνει SQL migration στο `drizzle/`.
3. `pnpm db:push` (dev) ή commit + apply στο Neon (prod).
