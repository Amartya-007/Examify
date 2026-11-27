# Billing, credits and admin: backend integration guide

The front end is complete: pricing, payment wall, Razorpay Checkout, billing page and the admin dashboard.
This guide is the contract the backend has to implement. Every screen already calls these endpoints
through `lib/billing/client.ts`; nothing in the UI needs to change once they exist.

> Demo builds (`NEXT_PUBLIC_EXAMIFY_DEMO=1`, never in production) simulate every endpoint in the browser,
> so the whole flow can be reviewed without a server. Search the code for `BILLING_DEMO` to see the stand-ins.

---

## 1. Business rules (single source: `lib/billing/config.ts`)

| Rule | Value |
|---|---|
| Interview cost | 2 credits per question (5 questions = 10 credits) |
| Sign-up bonus | 20 credits, once per account |
| Low-balance warning | under 10 credits |
| Packs (one-time, never expire) | `try` 10 credits ₹1 / $0.05 · `starter` 120 credits ₹99 / $1.50 · `plus` 350 credits ₹249 / $3.50 |
| Subscriptions | `pro_month` 600 credits/month ₹449 / $5 · `pro_year` 7,200 credits/year ₹4,499 / $50 |
| Voice setup call | free (no credits) |

The backend must read prices and credits from the same ids. Never trust an amount sent by the browser.

## 2. Environment variables

```
RAZORPAY_KEY_ID=rzp_live_xxx            # also returned to the browser by /checkout
RAZORPAY_KEY_SECRET=xxx                 # server only
RAZORPAY_WEBHOOK_SECRET=xxx             # server only
RAZORPAY_PLAN_PRO_MONTH=plan_xxx        # create in Razorpay Dashboard > Subscriptions > Plans
RAZORPAY_PLAN_PRO_YEAR=plan_xxx
```

USD prices need **International Payments** enabled on the Razorpay account. Until then, only offer INR
(set `USD` prices aside or hide the currency toggle in `components/billing/PlanPicker.tsx`).

## 3. Firestore data

**`users/{uid}`** (fields added to the existing doc)

| Field | Type | Notes |
|---|---|---|
| `credits` | number | Current balance. Only the server writes it, inside a transaction. |
| `plan` | `"free" \| "pro_month" \| "pro_year"` | |
| `planStatus` | `"active" \| "cancelled" \| "past_due" \| null` | `cancelled` = stays Pro until `planRenewsAt` |
| `planRenewsAt` | ISO string \| null | |
| `razorpaySubscriptionId` | string \| null | |
| `role` | `"user" \| "admin"` | Set `"admin"` by hand in the Firestore console for admins |
| `status` | `"active" \| "suspended"` | `getCurrentUser()` already treats `suspended` as signed out |
| `createdAt`, `lastActiveAt` | ISO string | |

**`users/{uid}/ledger/{txnId}`**: one doc per credit change (type `CreditTxn` in `types/index.d.ts`):
`delta`, `reason` (`signup_bonus | pack_purchase | plan_renewal | interview | admin_grant | refund | expiry`),
`note`, `balanceAfter`, `createdAt`, optional `interviewId`, `paymentId`.

**`payments/{razorpayPaymentId}`**: one doc per payment (type `PaymentRecord`). Use the Razorpay payment id as
the document id so webhooks and `/verify` are idempotent.

Give new users 20 credits and a `signup_bonus` ledger row when the user doc is first created
(`signUp` and `signInWithProvider` in `lib/actions/auth.action.ts`).

## 4. User endpoints

All require the session cookie (use `getCurrentUser()`); respond `401` without it. JSON in, JSON out.

| Method and path | Body | Returns | Used by |
|---|---|---|---|
| `GET /api/billing/balance` | | `{ credits, plan, planStatus, planRenewsAt }` | sidebar card, paywall, billing |
| `POST /api/billing/consume` | `{ interviewId, questions }` | balance, or **`402 { needed, balance }`** | green room "Join interview" |
| `POST /api/billing/checkout` | `{ kind: "pack"\|"plan", productId, currency: "INR"\|"USD" }` | `{ keyId, orderId?, subscriptionId?, amount, currency, name, description, prefill? }` | paywall "Pay" |
| `POST /api/billing/verify` | `{ razorpay_payment_id, razorpay_order_id?, razorpay_subscription_id?, razorpay_signature, kind, productId, currency }` | balance | after Razorpay success |
| `POST /api/billing/subscription/cancel` | | balance | billing page |
| `GET /api/billing/ledger` | | `CreditTxn[]` (newest first, 100 max) | billing page |
| `GET /api/billing/payments` | | `PaymentRecord[]` with `receiptUrl` | billing page |

### consume
Run in a Firestore **transaction**: read `credits`, compute `cost = questions * 2` on the server, and if
`credits < cost` return `402`. Otherwise subtract it, write an `interview` ledger row, and return the new
balance. Refund the same amount (reason `refund`) when an interview ends with no answers: `createFeedback`
in `lib/actions/general.action.ts` already detects this case and returns `{ error: "empty" }`.

### checkout
- **Pack:** `razorpay.orders.create({ amount: price * 100, currency, receipt: uid + time, notes: { uid, productId } })`.
- **Plan:** `razorpay.subscriptions.create({ plan_id: env[plan.razorpayPlanEnv], total_count: 120, customer_notify: 1, notes: { uid, productId } })`.
- Return `keyId: RAZORPAY_KEY_ID`, the id, `amount` in paise/cents, and `prefill` (name, email).

### verify
Check the signature before crediting anything:
- Order: `HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET) === razorpay_signature`
- Subscription: `HMAC_SHA256(payment_id + "|" + subscription_id, KEY_SECRET) === razorpay_signature`

Then, in one transaction (skip if `payments/{paymentId}` already exists): write the payment, add credits,
write the ledger row, and for plans set `plan`, `planStatus: "active"`, `planRenewsAt`, `razorpaySubscriptionId`.
If verification fails, return `400`; the UI shows "We're still confirming this payment" and the webhook
will finish the job.

## 5. Webhooks: `POST /api/billing/webhook`

Verify `X-Razorpay-Signature` = `HMAC_SHA256(rawBody, WEBHOOK_SECRET)`. Handle idempotently by payment id.

| Event | Do |
|---|---|
| `payment.captured` | Same as `/verify` for packs (covers users who closed the tab) |
| `payment.failed` | Write `payments/{id}` with `status: "failed"` (shows in admin) |
| `subscription.activated` | Set plan active, store subscription id |
| `subscription.charged` | Each renewal: add `creditsPerPeriod`, ledger `plan_renewal`, update `planRenewsAt` |
| `subscription.cancelled` / `completed` | `planStatus: "cancelled"`; at `planRenewsAt` set `plan: "free"` |
| `subscription.halted` | `planStatus: "past_due"` |
| `refund.processed` | Payment `status: "refunded"`; remove unused credits (ledger `refund`) |

## 6. Admin endpoints

Every `/api/admin/*` handler must load the user and return `404` unless `role === "admin"`.
The `/admin` pages are already guarded in `app/admin/layout.tsx`, but the API must check too.

| Method and path | Query or body | Returns |
|---|---|---|
| `GET /api/admin/overview` | `?range=7\|30\|90` | `AdminOverview` (totals, daily series, plan mix, pack sales) |
| `GET /api/admin/users` | `?q&plan(all\|free\|paid\|pro_month\|pro_year)&status(all\|low\|active\|suspended)&sort=field:asc\|desc&page&pageSize` | `{ rows: AdminUserRow[], total, page, pageSize }` |
| `GET /api/admin/users/:id` | | `{ user, ledger, payments }` |
| `POST /api/admin/users/:id/credits` | `{ delta, note }` | updated user row; write an `admin_grant` ledger row with the admin's uid |
| `POST /api/admin/users/:id/status` | `{ status: "active"\|"suspended" }` | updated user row |
| `GET /api/admin/payments` | `?status&q&page&pageSize` | `{ rows: PaymentRecord[], total, page, pageSize }` |

`AdminUserRow` = `User` plus `creditsPurchased`, `creditsUsed`, `interviews`, `revenueINR`. Keep these as
counters on the user doc (update them in the same transactions) so the table doesn't scan ledgers.
`AdminOverview` types are in `lib/billing/client.ts`. Convert USD to INR at a fixed rate for totals and
say which rate you use.

## 7. Testing

Use Razorpay **test mode** keys. Test UPI: `success@razorpay` / `failure@razorpay`. Test cards are listed in
Razorpay's docs. Check each screen state: success, failure, cancelled (close the window), and pending
(make `/verify` fail; the webhook should still credit the account).

## 8. Go-live checklist

- [ ] Razorpay KYC done, live keys in the server env, webhook URL added with the events above
- [ ] Fill every highlighted placeholder on `/terms`, `/privacy`, `/refunds`, `/contact` (Razorpay reviews these)
- [ ] International payments enabled, or USD hidden
- [ ] GST registration and invoice details decided (Razorpay can email invoices)
- [ ] At least one admin: set `role: "admin"` on their user doc
- [ ] Existing users backfilled with `credits: 20`, `plan: "free"`
