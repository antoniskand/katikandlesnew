-- 002_drop_viva.sql
-- Run AFTER successful Stripe migration & verifying no orders need viva data.
-- Removes Viva Wallet legacy columns from orders.

alter table orders
  drop column if exists viva_order_code,
  drop column if exists viva_transaction_id;
