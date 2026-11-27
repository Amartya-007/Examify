"use client";

/**
 * Browser-side billing API. Every function calls an endpoint the backend implements
 * (contract in docs/BILLING_INTEGRATION.md). In demo builds the same functions are
 * simulated locally so the UI can be reviewed end to end without a server.
 */
import { BILLING_DEMO } from "./mode";
import { PACKS, PLANS, interviewCost, type Currency } from "./config";
import { demoAdminData, demoDailySeries, demoLedger, type AdminUserRow } from "./demo-data";

export type Balance = { credits: number; plan: string; planStatus: User["planStatus"]; planRenewsAt: string | null };
export type CheckoutSession = {
  keyId: string;
  /** Set for one-time packs (Razorpay Orders). */
  orderId?: string;
  /** Set for plans (Razorpay Subscriptions). */
  subscriptionId?: string;
  amount: number; // minor units
  currency: Currency;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
};
export type VerifyPayload = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};
export class InsufficientCredits extends Error {
  constructor(public needed: number, public balance: number) {
    super("Not enough credits");
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, credentials: "include" });
  if (!res.ok) {
    let body: { message?: string; needed?: number; balance?: number } = {};
    try {
      body = await res.json();
    } catch {}
    if (res.status === 402) throw new InsufficientCredits(body.needed || 0, body.balance || 0);
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

/* ------------------------------------------------------------------ demo state */
const DEMO_KEY = "examify:demo-billing";
type DemoState = Balance & { ledger: CreditTxn[]; payments: PaymentRecord[] };
function demoRead(): DemoState {
  try {
    const s = JSON.parse(localStorage.getItem(DEMO_KEY) || "null");
    if (s) return s;
  } catch {}
  return { credits: 14, plan: "free", planStatus: null, planRenewsAt: null, ledger: demoLedger(14), payments: [] };
}
function demoWrite(s: DemoState) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(s));
  } catch {}
  window.dispatchEvent(new Event("examify:billing"));
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
export function demoReset() {
  localStorage.removeItem(DEMO_KEY);
  window.dispatchEvent(new Event("examify:billing"));
}

/* ------------------------------------------------------------------ user billing */
export async function getBalance(): Promise<Balance> {
  if (BILLING_DEMO) {
    const { credits, plan, planStatus, planRenewsAt } = demoRead();
    return { credits, plan, planStatus, planRenewsAt };
  }
  return api<Balance>("/api/billing/balance");
}

/** Spend credits for an interview. Throws InsufficientCredits (HTTP 402) when the balance is too low. */
export async function consumeCredits(input: { interviewId: string; questions: number }): Promise<Balance> {
  const cost = interviewCost(input.questions);
  if (BILLING_DEMO) {
    const s = demoRead();
    if (s.credits < cost) throw new InsufficientCredits(cost, s.credits);
    s.credits -= cost;
    s.ledger.unshift({ id: `t${Date.now()}`, userId: "demo-user", delta: -cost, reason: "interview", note: `Interview, ${input.questions} questions`, balanceAfter: s.credits, createdAt: new Date().toISOString(), interviewId: input.interviewId });
    demoWrite(s);
    return getBalance();
  }
  return api<Balance>("/api/billing/consume", { method: "POST", body: JSON.stringify(input) });
}

export async function createCheckout(input: { kind: "pack" | "plan"; productId: string; currency: Currency }): Promise<CheckoutSession> {
  if (BILLING_DEMO) {
    await wait(500);
    const product = input.kind === "pack" ? PACKS.find((p) => p.id === input.productId)! : PLANS.find((p) => p.id === input.productId)!;
    return {
      keyId: "rzp_test_demo",
      orderId: input.kind === "pack" ? `order_demo_${Date.now()}` : undefined,
      subscriptionId: input.kind === "plan" ? `sub_demo_${Date.now()}` : undefined,
      amount: Math.round(product.price[input.currency] * 100),
      currency: input.currency,
      name: "Examify",
      description: input.kind === "pack" ? `${product.name} pack` : `${product.name} subscription`,
    };
  }
  return api<CheckoutSession>("/api/billing/checkout", { method: "POST", body: JSON.stringify(input) });
}

/** Server verifies the Razorpay signature, records the payment and credits the account. */
export async function verifyPayment(payload: VerifyPayload & { kind: "pack" | "plan"; productId: string; currency: Currency }): Promise<Balance> {
  if (BILLING_DEMO) {
    await wait(900);
    const s = demoRead();
    const product = payload.kind === "pack" ? PACKS.find((p) => p.id === payload.productId)! : PLANS.find((p) => p.id === payload.productId)!;
    const credits = "credits" in product ? product.credits : product.creditsPerPeriod;
    s.credits += credits;
    if (payload.kind === "plan") {
      s.plan = product.id;
      s.planStatus = "active";
      s.planRenewsAt = new Date(Date.now() + ((product as (typeof PLANS)[number]).interval === "year" ? 365 : 30) * 864e5).toISOString();
    }
    const paymentId = payload.razorpay_payment_id;
    s.ledger.unshift({ id: `t${Date.now()}`, userId: "demo-user", delta: credits, reason: payload.kind === "pack" ? "pack_purchase" : "plan_renewal", note: `${product.name} ${payload.kind === "pack" ? "pack" : "plan"}`, balanceAfter: s.credits, createdAt: new Date().toISOString(), paymentId });
    s.payments.unshift({ id: paymentId, userId: "demo-user", kind: payload.kind, productId: product.id, amount: Math.round(product.price[payload.currency] * 100), currency: payload.currency, credits, status: "captured", razorpayPaymentId: paymentId, method: "upi", createdAt: new Date().toISOString() });
    demoWrite(s);
    return getBalance();
  }
  return api<Balance>("/api/billing/verify", { method: "POST", body: JSON.stringify(payload) });
}

export async function cancelSubscription(): Promise<Balance> {
  if (BILLING_DEMO) {
    await wait(600);
    const s = demoRead();
    s.planStatus = "cancelled";
    demoWrite(s);
    return getBalance();
  }
  return api<Balance>("/api/billing/subscription/cancel", { method: "POST" });
}

export async function getLedger(): Promise<CreditTxn[]> {
  if (BILLING_DEMO) return demoRead().ledger;
  return api<CreditTxn[]>("/api/billing/ledger");
}

export async function getPayments(): Promise<PaymentRecord[]> {
  if (BILLING_DEMO) {
    const s = demoRead();
    const seeded: PaymentRecord = { id: "pay_demo_1", userId: "demo-user", kind: "pack", productId: "try", amount: 100, currency: "INR", credits: 10, status: "captured", razorpayPaymentId: "pay_demo_1", method: "upi", createdAt: new Date(Date.now() - 9 * 864e5).toISOString() };
    return [...s.payments, seeded];
  }
  return api<PaymentRecord[]>("/api/billing/payments");
}

/* ------------------------------------------------------------------ admin */
export type AdminOverview = {
  totals: {
    users: number;
    newUsers: number;
    activeUsers: number;
    payingUsers: number;
    activeSubscriptions: number;
    revenueINR: number;
    mrrINR: number;
    creditsSold: number;
    creditsUsed: number;
    creditsOutstanding: number;
    conversionRate: number;
  };
  daily: { date: string; revenue: number; creditsSold: number; creditsUsed: number; signups: number }[];
  planMix: { plan: string; users: number }[];
  topPacks: { productId: string; purchases: number; revenueINR: number }[];
};
export type AdminUsersQuery = { q?: string; plan?: string; status?: string; sort?: string; page?: number; pageSize?: number };
export type AdminUsersPage = { rows: AdminUserRow[]; total: number; page: number; pageSize: number };
export type AdminUserDetail = { user: AdminUserRow; ledger: CreditTxn[]; payments: PaymentRecord[] };

export async function adminOverview(range: 7 | 30 | 90 = 30): Promise<AdminOverview> {
  if (BILLING_DEMO) {
    await wait(250);
    const { users, payments } = demoAdminData();
    const daily = demoDailySeries(range);
    const since = Date.now() - range * 864e5;
    const inRange = payments.filter((p) => p.status === "captured" && new Date(p.createdAt).getTime() >= since);
    const toINR = (p: PaymentRecord) => (p.currency === "INR" ? p.amount / 100 : (p.amount / 100) * 83);
    const subs = users.filter((u) => u.plan !== "free" && u.planStatus === "active");
    const paying = new Set(payments.filter((p) => p.status === "captured").map((p) => p.userId));
    const packs = PACKS.map((pk) => {
      const ps = inRange.filter((p) => p.productId === pk.id);
      return { productId: pk.id, purchases: ps.length, revenueINR: Math.round(ps.reduce((s, p) => s + toINR(p), 0)) };
    });
    return {
      totals: {
        users: users.length,
        newUsers: users.filter((u) => new Date(u.createdAt!).getTime() >= since).length,
        activeUsers: users.filter((u) => new Date(u.lastActiveAt!).getTime() >= Date.now() - 7 * 864e5).length,
        payingUsers: paying.size,
        activeSubscriptions: subs.length,
        revenueINR: Math.round(inRange.reduce((s, p) => s + toINR(p), 0)),
        mrrINR: Math.round(subs.reduce((s, u) => s + (u.plan === "pro_year" ? 4499 / 12 : 449), 0)),
        creditsSold: daily.reduce((s, d) => s + d.creditsSold, 0),
        creditsUsed: daily.reduce((s, d) => s + d.creditsUsed, 0),
        creditsOutstanding: users.reduce((s, u) => s + (u.credits || 0), 0),
        conversionRate: paying.size / users.length,
      },
      daily,
      planMix: [
        { plan: "free", users: users.filter((u) => u.plan === "free").length },
        { plan: "pro_month", users: users.filter((u) => u.plan === "pro_month").length },
        { plan: "pro_year", users: users.filter((u) => u.plan === "pro_year").length },
      ],
      topPacks: packs,
    };
  }
  return api<AdminOverview>(`/api/admin/overview?range=${range}`);
}

export async function adminUsers(q: AdminUsersQuery = {}): Promise<AdminUsersPage> {
  const page = q.page || 1;
  const pageSize = q.pageSize || 12;
  if (BILLING_DEMO) {
    await wait(200);
    let rows = [...demoAdminData().users];
    const needle = (q.q || "").trim().toLowerCase();
    if (needle) rows = rows.filter((u) => `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(needle));
    if (q.plan && q.plan !== "all") rows = rows.filter((u) => (q.plan === "paid" ? u.plan !== "free" : u.plan === q.plan));
    if (q.status && q.status !== "all") rows = rows.filter((u) => (q.status === "low" ? (u.credits || 0) < 10 : u.status === q.status));
    const [key, dir] = (q.sort || "createdAt:desc").split(":") as [keyof AdminUserRow, string];
    rows.sort((a, b) => {
      const av = a[key] ?? "", bv = b[key] ?? "";
      const c = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return dir === "asc" ? c : -c;
    });
    return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize };
  }
  const params = new URLSearchParams(Object.entries({ ...q, page, pageSize }).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
  return api<AdminUsersPage>(`/api/admin/users?${params}`);
}

export async function adminUser(id: string): Promise<AdminUserDetail> {
  if (BILLING_DEMO) {
    await wait(200);
    const { users, payments } = demoAdminData();
    const user = users.find((u) => u.id === id)!;
    const ps = payments.filter((p) => p.userId === id);
    let bal = 0;
    const ledger: CreditTxn[] = [
      { id: "l0", userId: id, delta: 20, reason: "signup_bonus" as const, note: "Welcome credits", createdAt: user.createdAt!, balanceAfter: 0 },
      ...ps.filter((p) => p.status === "captured").map((p) => ({ id: `l_${p.id}`, userId: id, delta: p.credits, reason: (p.kind === "pack" ? "pack_purchase" : "plan_renewal") as CreditTxn["reason"], note: p.productId, createdAt: p.createdAt, paymentId: p.id, balanceAfter: 0 })),
      ...(user.creditsUsed
        ? [{ id: "lu", userId: id, delta: -user.creditsUsed, reason: "interview" as const, note: `${user.interviews} interviews`, createdAt: [user.lastActiveAt!, ...ps.map((p) => p.createdAt)].sort().at(-1)!, balanceAfter: 0 }]
        : []),
    ]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((t) => ({ ...t, balanceAfter: (bal += t.delta) }))
      .reverse();
    return { user, ledger, payments: ps };
  }
  return api<AdminUserDetail>(`/api/admin/users/${encodeURIComponent(id)}`);
}

export async function adminGrantCredits(id: string, delta: number, note: string): Promise<AdminUserRow> {
  if (BILLING_DEMO) {
    await wait(400);
    const u = demoAdminData().users.find((x) => x.id === id)!;
    u.credits = (u.credits || 0) + delta;
    if (delta > 0) u.creditsPurchased += 0;
    return u;
  }
  return api<AdminUserRow>(`/api/admin/users/${encodeURIComponent(id)}/credits`, { method: "POST", body: JSON.stringify({ delta, note }) });
}

export async function adminSetStatus(id: string, status: "active" | "suspended"): Promise<AdminUserRow> {
  if (BILLING_DEMO) {
    await wait(300);
    const u = demoAdminData().users.find((x) => x.id === id)!;
    u.status = status;
    return u;
  }
  return api<AdminUserRow>(`/api/admin/users/${encodeURIComponent(id)}/status`, { method: "POST", body: JSON.stringify({ status }) });
}

export async function adminPayments(q: { status?: string; q?: string; page?: number; pageSize?: number } = {}): Promise<{ rows: PaymentRecord[]; total: number; page: number; pageSize: number }> {
  const page = q.page || 1;
  const pageSize = q.pageSize || 15;
  if (BILLING_DEMO) {
    await wait(200);
    let rows = [...demoAdminData().payments];
    if (q.status && q.status !== "all") rows = rows.filter((p) => p.status === q.status);
    const needle = (q.q || "").trim().toLowerCase();
    if (needle) rows = rows.filter((p) => `${p.userName} ${p.userEmail} ${p.razorpayPaymentId} ${p.razorpayOrderId}`.toLowerCase().includes(needle));
    return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize };
  }
  const params = new URLSearchParams(Object.entries({ ...q, page, pageSize }).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
  return api(`/api/admin/payments?${params}`);
}

export type { AdminUserRow };
