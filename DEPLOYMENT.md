# Deployment Guide — Kati Kandles v2

## Πριν το deploy

### 1. Install packages
```bash
pnpm install
```

### 2. Supabase migrations
Στο Supabase SQL Editor, τρέξε με τη σειρά:

1. **`scripts/migrations/001_drops_admin_stripe.sql`** — δημιουργεί `drops`, `admin_users`, `site_settings`, `newsletter_subscribers` tables και προσθέτει `stripe_session_id` + `stripe_payment_intent_id` columns στο `orders`.
2. (Αργότερα, μετά Stripe go-live) **`scripts/migrations/002_drop_viva.sql`** — αφαιρεί τα παλιά viva columns.

### 3. Δημιούργησε admin user

a. Στο Supabase Dashboard → Authentication → Users → Add user → email + password (αυτά θα βάλεις στο /admin/login)

b. Στο SQL Editor:
```sql
insert into admin_users (id, email, role)
values (
  (select id from auth.users where email = 'YOUR_EMAIL@example.com'),
  'YOUR_EMAIL@example.com',
  'owner'
);
```

### 4. Env vars (Vercel + .env.local)

```
NEXT_PUBLIC_SITE_URL=https://katikandles.gr
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### 5. Stripe Webhook
Στο Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://katikandles.gr/api/payments/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `charge.refunded`
- Αντιγραψε το signing secret στο `STRIPE_WEBHOOK_SECRET`.

## Πώς δουλεύει το νέο σύστημα

### CMS — `/admin`
- Login με Supabase Auth (email/password)
- Sidebar tabs: Dashboard, Προϊόντα, Drops, Παραγγελίες, Σελίδες, Κατηγορίες, Κουπόνια, Newsletter, Ρυθμίσεις
- Σελίδες με rich text editor (Tiptap)
- Drops με scheduled start/end, featured flag, multi-product picker
- Image uploads via Vercel Blob

### Drops στο homepage
- Στο admin → Drops → toggle "featured" + "active"
- Αν υπάρχει featured drop, εμφανίζεται στο `<AnniversaryDropSection>` της αρχικής
- Διαφορετικά, η section δεν renderάρει (returns null)

### Stripe checkout flow
1. Χρήστης συμπληρώνει checkout form
2. POST `/api/payments/stripe/checkout` → δημιουργεί order σε Supabase με status `payment_pending`
3. Δημιουργεί Stripe Checkout Session με metadata το order_id
4. Redirect στο Stripe-hosted page
5. Μετά την πληρωμή → Stripe webhook hits `/api/payments/stripe/webhook` → ενημερώνει order σε `paid`, αφαιρεί stock, αυξάνει χρήσεις κουπονιού
6. Stripe redirect στο `/checkout/success?session_id=...`

### v0 + Vercel sync
Pushάρεις τοπικά → GitHub → Vercel auto-deploys. v0.dev sync μέσα.

## Τι δεν κάνει (yet)
- **Email notifications** για παραγγελίες — προσθήκη με Resend/Postmark αργότερα
- **Variants** στο product form — υπάρχει το schema, η UI δεν εκθέτει variant editing
- **Analytics dashboard** — μόνο revenue + count στο admin homepage

## Troubleshooting

### "stripe_payment_intent_id column does not exist"
Δεν τρέξατε το `001_drops_admin_stripe.sql` migration.

### Admin login redirects σε loop
Δεν υπάρχει εγγραφή στο `admin_users` table. Δες "3. Δημιούργησε admin user".

### `pnpm install` fails on @tailwindcss/typography
Tailwind v4 — η σύνταξη είναι `@plugin "@tailwindcss/typography"` μέσα στο CSS (έχει ήδη μπει στο `styles/globals.css`).
