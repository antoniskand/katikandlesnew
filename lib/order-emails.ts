// lib/order-emails.ts
// Transactional order emails sent via Resend.
// Triggered after Stripe webhook flips an order to status='paid'.

import { Resend } from "resend"
import type { Order, OrderItem } from "@/types/product"

const FROM = process.env.AUTH_RESEND_FROM || "Kati Kandles <orders@katikandles.gr>"
const ADMIN_NOTIFY_EMAIL = process.env.ORDER_ADMIN_EMAIL || ""

function priceFmt(n: number) {
  return `€${Number(n).toFixed(2).replace(".", ",")}`
}

function escape(s: string | null | undefined): string {
  if (!s) return ""
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function customerHtml(order: Order, items: OrderItem[]): string {
  const itemsRows = items
    .map(
      (i) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid rgba(26,26,26,0.10);vertical-align:top;">
            <div style="font-size:15px;color:#1a1a1a;line-height:1.4;">${escape(i.product_name)}</div>
            <div style="font-size:12px;color:rgba(26,26,26,0.55);margin-top:3px;letter-spacing:.06em;text-transform:uppercase;">
              ποσότητα · ${i.quantity}
            </div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid rgba(26,26,26,0.10);text-align:right;font-variant-numeric:tabular-nums;color:#1a1a1a;">
            ${priceFmt(i.line_total)}
          </td>
        </tr>`,
    )
    .join("")

  const couponRow =
    order.discount_total > 0
      ? `<tr>
          <td style="padding:6px 0;color:rgba(26,26,26,0.65);">έκπτωση${order.coupon_code ? ` · ${escape(order.coupon_code)}` : ""}</td>
          <td style="padding:6px 0;text-align:right;color:#0f9b81;font-variant-numeric:tabular-nums;">−${priceFmt(order.discount_total)}</td>
        </tr>`
      : ""

  const shippingValue =
    Number(order.shipping_total) === 0
      ? `<span style="color:#0f9b81;">δωρεάν</span>`
      : priceFmt(order.shipping_total)

  const addressLines = [
    order.shipping_address1,
    order.shipping_address2,
    [order.shipping_zip, order.shipping_city].filter(Boolean).join(" "),
    order.shipping_state,
    order.shipping_country,
  ]
    .filter(Boolean)
    .map((l) => escape(l!))
    .join("<br>")

  return `<!doctype html>
<html lang="el">
  <body style="margin:0;padding:32px 16px;background:#fafaf7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;">
      <tr><td style="padding:40px 36px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,26,26,0.50);">
          παραγγελία · ${escape(order.order_number)}
        </p>
        <h1 style="margin:0 0 20px;font-size:32px;line-height:1.05;font-weight:300;letter-spacing:-0.01em;color:#1a1a1a;">
          ευχαριστούμε, ${escape(order.customer_first_name || "")}!
        </h1>
        <p style="margin:0 0 32px;color:rgba(26,26,26,0.70);line-height:1.6;font-size:15px;">
          Η παραγγελία σου καταχωρήθηκε. Ξεκινάμε αμέσως την προετοιμασία —
          θα σου στείλουμε ξανά email όταν σταλεί ο πακέτο.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1a1a1a;margin-bottom:24px;">
          ${itemsRows}
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1a1a1a;">
          <tr>
            <td style="padding:6px 0;color:rgba(26,26,26,0.65);">υποσύνολο</td>
            <td style="padding:6px 0;text-align:right;font-variant-numeric:tabular-nums;">${priceFmt(order.subtotal)}</td>
          </tr>
          ${couponRow}
          <tr>
            <td style="padding:6px 0;color:rgba(26,26,26,0.65);">μεταφορικά${order.shipping_method_name ? ` · ${escape(order.shipping_method_name)}` : ""}</td>
            <td style="padding:6px 0;text-align:right;font-variant-numeric:tabular-nums;">${shippingValue}</td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px solid #1a1a1a;padding-top:16px;">
          <tr>
            <td style="padding:14px 0 0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,26,26,0.50);">
              σύνολο
            </td>
            <td style="padding:14px 0 0;text-align:right;font-size:36px;font-weight:300;letter-spacing:-0.01em;font-variant-numeric:tabular-nums;color:#1a1a1a;">
              ${priceFmt(order.grand_total)}
            </td>
          </tr>
        </table>

        ${
          addressLines
            ? `<div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(26,26,26,0.10);">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,26,26,0.50);">
                  αποστολή σε
                </p>
                <p style="margin:0;color:rgba(26,26,26,0.85);font-size:14px;line-height:1.65;">
                  ${escape((order.customer_first_name || "") + " " + (order.customer_last_name || ""))}<br>
                  ${addressLines}
                </p>
              </div>`
            : ""
        }

        <p style="margin:36px 0 0;font-size:13px;color:rgba(26,26,26,0.55);line-height:1.6;">
          Αν χρειάζεσαι κάτι, απάντησε σε αυτό το email ή στείλε μας στο
          <a href="mailto:hello@katikandles.gr" style="color:#1a1a1a;text-decoration:underline;">hello@katikandles.gr</a>.
        </p>

        <p style="margin:24px 0 0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,26,26,0.40);">
          kati diko mas
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}

function adminHtml(order: Order, items: OrderItem[]): string {
  const itemRows = items
    .map(
      (i) =>
        `<li>${escape(i.product_name)} × ${i.quantity} — ${priceFmt(i.line_total)}</li>`,
    )
    .join("")
  const customerName = `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim()
  return `<!doctype html>
<html lang="el"><body style="font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fafaf7;padding:24px;">
<h2 style="font-weight:400;margin:0 0 12px;">Νέα παραγγελία · ${escape(order.order_number)}</h2>
<p>Πελάτης: <strong>${escape(customerName)}</strong> · ${escape(order.customer_email || "")} · ${escape(order.customer_phone || "")}</p>
<p>Σύνολο: <strong>${priceFmt(order.grand_total)}</strong> (subtotal ${priceFmt(order.subtotal)}, shipping ${priceFmt(order.shipping_total)}${order.discount_total > 0 ? `, discount −${priceFmt(order.discount_total)}` : ""})</p>
<ul>${itemRows}</ul>
<p>Διεύθυνση: ${escape(order.shipping_address1 || "")}, ${escape(order.shipping_zip || "")} ${escape(order.shipping_city || "")}</p>
</body></html>`
}

export async function sendOrderConfirmation(
  order: Order,
  items: OrderItem[],
): Promise<void> {
  const apiKey = process.env.AUTH_RESEND_KEY
  if (!apiKey) {
    console.warn("[order-email] no AUTH_RESEND_KEY — skipping send")
    return
  }
  if (!order.customer_email) {
    console.warn("[order-email] order has no customer_email — skipping send")
    return
  }
  const client = new Resend(apiKey)

  // Customer
  try {
    await client.emails.send({
      from: FROM,
      to: order.customer_email,
      subject: `Παραλάβαμε την παραγγελία σου · ${order.order_number}`,
      html: customerHtml(order, items),
    })
  } catch (e) {
    console.error("[order-email] customer send failed:", e)
  }

  // Admin notification
  if (ADMIN_NOTIFY_EMAIL) {
    try {
      await client.emails.send({
        from: FROM,
        to: ADMIN_NOTIFY_EMAIL,
        subject: `Νέα παραγγελία · ${order.order_number}`,
        html: adminHtml(order, items),
      })
    } catch (e) {
      console.error("[order-email] admin notify failed:", e)
    }
  }
}
