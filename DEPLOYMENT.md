# Deployment Guide — Kati Kandles

Stack: **Next.js 15 + Drizzle + Neon Postgres + NextAuth (magic link via Resend) + Stripe + Vercel Blob**.

---

## 1) Install packages

```bash
pnpm install
```

## 2) Set up Neon

1. Δημιούργησε project στο [console.neon.tech](https://console.neon.tech).
2. Στο **Connection** tab, αντίγραψε το `DATABASE_URL` (postgresql://…).

## 3) Apply the schema

Δύο τρόποι — διάλεξε:

**Drizzle Kit (πιο γρήγορο για dev):**
```bash
export DATABASE_URL='postgresql://...'
pnpm db:push
```

**Plain SQL (πρώτη εγκατάσταση):**
Στο Neon SQL Editor, paste & run `scripts/migrations/001_initial.sql`.

## 4) Set up Resend (για magic-link emails)

1. Sign up στο [resend.com](https://resend.com) (free 100 emails/μέρα).
2. **API Keys** → δημιούργησε key (αντίγραψε το `re_...`).
3. **Domains** → πρόσθεσε `katikandles.gr` και κάνε verify τα DNS records (SPF, DKIM, DMARC). Μέχρι να γίνει verify, μπορείς να στέλνεις από `onboarding@resend.dev` (δικό τους test domain).

Πρόσθεσε στο `.env.local`:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

# NextAuth — required
AUTH_SECRET=<generate: openssl rand -base64 32>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# Resend (magic links)
AUTH_RESEND_KEY=re_xxxxxxxxxxxx
AUTH_RESEND_FROM="Kati Kandles <auth@katikandles.gr>"
# (κράτα 'Kati Kandles <onboarding@resend.dev>' μέχρι να γίνει verify το domain)
```

## 5) Δημιούργησε τον admin σου

Πρόσθεσε email στο allowlist (no password):

```bash
pnpm tsx scripts/create-admin.ts you@example.com 'Antonis' owner
```

Ή χειροκίνητα στο Neon SQL Editor:

```sql
insert into admin_users (email, display_name, role)
values ('you@example.com', 'Antonis', 'owner')
on conflict (email) do update set role = 'owner';
```

Μετά visit `/admin/login`, δώσε το email — έρχεται magic link στο inbox σου.

## 6) Stripe

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys → πάρε `sk_…` και `pk_…`.
2. Developers → Webhooks → Add endpoint:
   - URL: `https://YOUR-DOMAIN/api/payments/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `charge.refunded`
3. Σημείωσε το `whsec_…`.

## 7) Vercel env vars

```
NEXT_PUBLIC_SITE_URL=https://katikandles.gr

DATABASE_URL=postgresql://...
AUTH_SECRET=<random>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://katikandles.gr

AUTH_RESEND_KEY=re_...
AUTH_RESEND_FROM="Kati Kandles <auth@katikandles.gr>"

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

BLOB_READ_WRITE_TOKEN=...
```

## 8) Deploy

Push στο `main` — Vercel κάνει auto-deploy. Στο πρώτο deploy:

1. Verify ότι το build περνά (build logs).
2. Visit `/admin/login` → δώσε admin email → πάρε magic link → κλικ → είσαι μέσα.
3. Verify ότι βλέπεις τα stats (αν δεν έχεις data, θα είναι 0/€0).

---

## CI: Neon preview branches per PR

Έχει configure-αριστεί GitHub Actions workflow (`.github/workflows/neon_workflow.yml`) που:

- σε κάθε PR δημιουργεί νέο Neon branch (`preview/pr-…`) με αντίγραφο της DB,
- το διαγράφει όταν κλείσεις το PR.

GitHub Secrets / Variables που χρειάζονται (μπήκαν αυτόματα όταν συνδέθηκε το Neon):
- `NEON_API_KEY` (secret)
- `NEON_PROJECT_ID` (variable)

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
