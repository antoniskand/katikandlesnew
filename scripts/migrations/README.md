# Migrations — Neon Postgres

The schema is defined in **two equivalent places**:

1. **`lib/db/schema.ts`** — Drizzle schema (TypeScript). This is the source of truth your code uses.
2. **`scripts/migrations/001_initial.sql`** — Plain SQL for first-time setup.

You can pick one of two ways to apply changes to Neon.

---

## Option A — Drizzle Kit (recommended)

```bash
# Generate a SQL migration from changes in lib/db/schema.ts
pnpm db:generate

# Push schema directly to Neon (no migration file, dev-friendly)
pnpm db:push
```

Both commands need `DATABASE_URL` in your shell:

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST/neondb?sslmode=require'
```

## Option B — Run the SQL by hand

In the Neon SQL Editor, paste & run `001_initial.sql`. This creates every table the app needs.

---

## After the schema is up — make yourself an admin

You need a user in **Stack Auth** (Neon Auth dashboard → Auth → Users → invite/create).
Note its `id` (a UUID-shaped string). Then in Neon SQL Editor:

```sql
insert into admin_users (id, email, display_name, role)
values (
  'STACK_USER_ID',         -- the user id from Stack Auth
  'you@example.com',
  'Antonis',
  'owner'
)
on conflict (id) do update set role = 'owner';
```

Now sign in at `/admin/login` — the layout will check `admin_users` and grant you access.

---

## Env vars

Set these in Vercel (and `.env.local` for local dev):

```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...

NEXT_PUBLIC_SITE_URL=https://katikandles.gr
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
BLOB_READ_WRITE_TOKEN=...
```
