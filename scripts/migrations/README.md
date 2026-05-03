# Migrations — Neon Postgres

The schema is defined in **two equivalent places**:

1. **`lib/db/schema.ts`** — Drizzle schema (TypeScript). Source of truth for the app code.
2. **`scripts/migrations/001_initial.sql`** — Plain SQL for first-time setup.

Pick one of two ways to apply changes to Neon.

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

The app uses **NextAuth v5 Credentials** — username/password are stored in the
`admin_users` table with a bcrypt hash. Two ways to seed the first admin:

### A. With the script

```bash
pnpm tsx scripts/create-admin.ts you@example.com 'YourStrongPassword' 'Antonis' owner
```

### B. By hand in Neon SQL Editor

1. Generate the bcrypt hash locally:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YourStrongPassword', 12))"
   ```
2. Run:
   ```sql
   insert into admin_users (email, password_hash, display_name, role)
   values ('you@example.com', '$2a$12$...', 'Antonis', 'owner')
   on conflict (email)
   do update set password_hash = excluded.password_hash, role = excluded.role;
   ```

Now sign in at `/admin/login`.

---

## Env vars

Set these in Vercel (and `.env.local` for local dev):

```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require

# NextAuth
AUTH_SECRET=<openssl rand -base64 32>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://katikandles.gr

NEXT_PUBLIC_SITE_URL=https://katikandles.gr
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
BLOB_READ_WRITE_TOKEN=...
```
