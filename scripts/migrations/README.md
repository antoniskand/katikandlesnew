# Migrations

Run these in Supabase SQL Editor in order. They are **idempotent** — safe to re-run.

## Order

1. **001_drops_admin_stripe.sql** — Adds `drops`, `admin_users`, `site_settings`, `newsletter_subscribers` tables; adds `stripe_session_id` + `stripe_payment_intent_id` to `orders`.
2. **002_drop_viva.sql** — Removes Viva Wallet columns from `orders`. **Run only after Stripe is live and you no longer need Viva data.**

## After 001 — make yourself owner

In Supabase Dashboard → Authentication → add a user with your email + password.
Then in SQL Editor, run:

```sql
insert into admin_users (id, email, role)
values (
  (select id from auth.users where email = 'your@email.com'),
  'your@email.com',
  'owner'
);
```

## Env vars (Vercel + .env.local)

```
NEXT_PUBLIC_SITE_URL=https://katikandles.gr
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
BLOB_READ_WRITE_TOKEN=...
```
