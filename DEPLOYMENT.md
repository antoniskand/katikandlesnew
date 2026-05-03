# Deployment Guide — Kati Kandles

Stack: **Next.js 15 + Drizzle + Neon Postgres + NextAuth (Auth.js v5) + Stripe + Vercel Blob**.

---

## 1) Install packages

```bash
pnpm install
```

## 2) Set up Neon

1. Δημιούργησε project στο [console.neon.tech](https://console.neon.tech).
2. Στο **Connection** tab, αντίγραψε το `DATABASE_URL` (postgresql://…).

Πρόσθεσε στο `.env.local`:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

# NextAuth — required
AUTH_SECRET=<generate one with: openssl rand -base64 32>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000   # or your production URL
```

> **Σημείωση**: το `AUTH_SECRET` πρέπει να είναι τυχαίο string, ίδιο σε όλα τα environments
> ενός deployment. Στο Vercel → Settings → Environment Variables.

## 3) Apply the schema

Δύο τρόποι — διάλεξε:

**Drizzle Kit (πιο γρήγορο για dev):**
```bash
pnpm db:push
```

**Plain SQL (πρώτη εγκατάσταση):**
Στο Neon SQL Editor, paste & run `scripts/migrations/001_initial.sql`.

## 4) Δημιούργησε τον admin σου

Έχεις **δύο επιλογές**:

### A. Με το script (συνιστάται)

```bash
# DATABASE_URL must be set
pnpm tsx scripts/create-admin.ts you@example.com 'YourStrongPassword' 'Antonis' owner
```

### B. Με το χέρι στο Neon SQL Editor

1. Στο τερματικό σου, φτιάξε bcrypt hash:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YourStrongPassword', 12))"
   ```
2. Πέρασε το στο SQL:
   ```sql
   insert into admin_users (email, password_hash, display_name, role)
   values ('you@example.com', '$2a$12$...', 'Antonis', 'owner');
   ```

Μετά visit `/admin/login` και βάλε email + password.

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
AUTH_SECRET=<random>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://katikandles.gr

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

BLOB_READ_WRITE_TOKEN=...
```

## 7) Deploy

Push στο `main` — Vercel κάνει auto-deploy. Στο πρώτο deploy:

1. Verify ότι το build περνά (build logs).
2. Visit `/admin/login` → sign in με τα credentials που έβαλες στο βήμα 4.
3. Verify ότι βλέπεις τα stats (αν δεν έχεις data, θα είναι 0/€0).

---

## CI: Neon preview branches per PR

Έχει configure-αριστεί GitHub Actions workflow (`.github/workflows/neon_workflow.yml`) που:

- σε κάθε PR δημιουργεί νέο Neon branch (`preview/pr-…`) με αντίγραφο της DB,
- το διαγράφει όταν κλείσεις το PR.

Για να δουλέψει, χρειάζονται GitHub Secrets / Variables στο repo:
- `NEON_API_KEY` (secret)
- `NEON_PROJECT_ID` (variable)

Όταν συνδέθηκε το Neon με το GitHub, αυτά μπήκαν αυτόματα.

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
