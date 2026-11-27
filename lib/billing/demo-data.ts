/**
 * Simulated billing and admin data for demo builds only. Deterministic (seeded) so the
 * dashboard looks the same on every load. Names are invented sample users.
 */
import { PACKS, PLANS, interviewCost } from "./config";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}
const day = 864e5;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

const FIRST = ["Aarav", "Diya", "Kabir", "Ananya", "Vihaan", "Isha", "Arjun", "Meera", "Rohan", "Sara", "Ishaan", "Tara", "Neel", "Riya", "Kiran", "Zoya", "Dev", "Nisha", "Aditya", "Priya", "Omar", "Lena", "Mateo", "Hana", "Lucas", "Amara", "Noah", "Yuki", "Elena", "Samuel", "Fatima", "Leo"];
const LAST = ["Mehta", "Sharma", "Iyer", "Kapoor", "Reddy", "Nair", "Gupta", "Bose", "Khan", "Das", "Verma", "Joshi", "Pillai", "Malik", "Sato", "Rossi", "Silva", "Novak", "Okafor", "Garcia"];

export type AdminUserRow = User & {
  creditsPurchased: number;
  creditsUsed: number;
  interviews: number;
  revenueINR: number;
};

let cache: { users: AdminUserRow[]; payments: PaymentRecord[] } | null = null;

export function demoAdminData() {
  if (cache) return cache;
  const r = rng(42);
  const users: AdminUserRow[] = [];
  const payments: PaymentRecord[] = [];
  for (let i = 0; i < 48; i++) {
    const first = i === 0 ? "Aarav" : FIRST[Math.floor(r() * FIRST.length)];
    const last = i === 0 ? "Mehta" : LAST[Math.floor(r() * LAST.length)];
    const id = i === 0 ? "demo-user" : `u${(1000 + i).toString(36)}${Math.floor(r() * 1e4)}`;
    const joinedAgo = Math.floor(r() * 85 + 2) * day;
    const roll = r();
    let plan = i === 0 ? "free" : roll > 0.82 ? "pro_month" : roll > 0.8 ? "pro_year" : "free";
    let purchased = 20; // signup bonus
    let revenue = 0;
    const nPay = plan === "free" ? (r() > 0.55 ? Math.floor(r() * 3) + 1 : 0) : Math.floor(r() * 2) + 1;
    for (let k = 0; k < nPay; k++) {
      const isPlan = plan !== "free" && k === 0;
      const product = isPlan ? PLANS.find((p) => p.id === plan)! : PACKS[Math.min(2, Math.floor(r() * 3.2))];
      const credits = isPlan ? (product as (typeof PLANS)[number]).creditsPerPeriod : (product as (typeof PACKS)[number]).credits;
      const usd = r() > 0.85;
      const currency = usd ? "USD" : "INR";
      const amount = Math.round(product.price[currency] * 100);
      const failed = r() > 0.92;
      const status: PaymentRecord["status"] = failed ? "failed" : r() > 0.97 ? "refunded" : "captured";
      const at = Math.max(day * 0.2, joinedAgo - r() * joinedAgo);
      payments.push({
        id: `pay_${id}_${k}`,
        userId: id,
        userName: `${first} ${last}`,
        userEmail: `${first}.${last}${i}@example.com`.toLowerCase(),
        kind: isPlan ? "plan" : "pack",
        productId: product.id,
        amount,
        currency,
        credits,
        status,
        razorpayOrderId: isPlan ? undefined : `order_${(1e9 + Math.floor(r() * 9e9)).toString(36)}`,
        razorpaySubscriptionId: isPlan ? `sub_${(1e9 + Math.floor(r() * 9e9)).toString(36)}` : undefined,
        razorpayPaymentId: failed ? undefined : `pay_${(1e9 + Math.floor(r() * 9e9)).toString(36)}`,
        method: ["upi", "card", "netbanking", "upi", "wallet"][Math.floor(r() * 5)],
        createdAt: iso(at),
      });
      if (isPlan && status !== "captured") plan = "free"; // the subscription never started
      if (status === "captured") {
        purchased += credits;
        revenue += currency === "INR" ? amount / 100 : (amount / 100) * 83;
      }
    }
    const interviews = Math.floor(r() * Math.min(40, purchased / interviewCost(5)));
    const used = Math.min(purchased, interviews * interviewCost(4 + Math.floor(r() * 3)));
    users.push({
      id,
      name: `${first} ${last}`,
      email: i === 0 ? "aarav@example.com" : `${first}.${last}${i}@example.com`.toLowerCase(),
      role: i === 0 ? "admin" : "user",
      plan,
      planStatus: plan === "free" ? null : r() > 0.88 ? "cancelled" : "active",
      planRenewsAt: plan === "free" ? null : new Date(Date.now() + Math.floor(r() * 28 + 1) * day).toISOString(),
      credits: i === 0 ? 14 : purchased - used,
      creditsPurchased: purchased,
      creditsUsed: used,
      interviews,
      revenueINR: Math.round(revenue),
      createdAt: iso(joinedAgo),
      lastActiveAt: iso(Math.floor(r() * Math.min(joinedAgo / day, 30)) * day + r() * day),
      status: r() > 0.97 ? "suspended" : "active",
      onboarded: true,
    });
  }
  payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  cache = { users, payments };
  return cache;
}

/** Daily series for the last `days` days: revenue (INR), credits sold, credits used, signups. */
export function demoDailySeries(days = 30) {
  const { users, payments } = demoAdminData();
  const r = rng(7);
  const out = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * day);
    return { date: d.toISOString().slice(0, 10), revenue: 0, creditsSold: 0, creditsUsed: 0, signups: 0 };
  });
  const idx = (isoDate: string) => out.findIndex((o) => o.date === isoDate.slice(0, 10));
  payments.forEach((p) => {
    const k = idx(p.createdAt);
    if (k < 0 || p.status !== "captured") return;
    out[k].revenue += p.currency === "INR" ? p.amount / 100 : (p.amount / 100) * 83;
    out[k].creditsSold += p.credits;
  });
  users.forEach((u) => {
    const k = idx(u.createdAt!);
    if (k >= 0) out[k].signups += 1;
  });
  out.forEach((o, i) => (o.creditsUsed = Math.round(320 + i * (300 / days) + r() * 260 - (new Date(o.date).getDay() % 6 === 0 ? 140 : 0))));
  return out.map((o) => ({ ...o, revenue: Math.round(o.revenue) }));
}

/** The signed-in demo user's own history. */
export function demoLedger(balance: number): CreditTxn[] {
  const rows: Omit<CreditTxn, "balanceAfter">[] = [
    { id: "t1", userId: "demo-user", delta: 20, reason: "signup_bonus", note: "Welcome credits", createdAt: iso(21 * day) },
    { id: "t2", userId: "demo-user", delta: -8, reason: "interview", note: "React Native Developer, 4 questions", createdAt: iso(13 * day) },
    { id: "t3", userId: "demo-user", delta: 10, reason: "pack_purchase", note: "Try one pack", createdAt: iso(9 * day), paymentId: "pay_demo_1" },
    { id: "t4", userId: "demo-user", delta: -8, reason: "interview", note: "Frontend Developer, 4 questions", createdAt: iso(7 * day) },
  ];
  let b = 0;
  const withBal = rows.map((t) => ({ ...t, balanceAfter: (b += t.delta) }));
  if (b !== balance) withBal.push({ id: "t5", userId: "demo-user", delta: balance - b, reason: balance > b ? "admin_grant" : "interview", note: balance > b ? "Adjustment" : "Interview", createdAt: iso(day), balanceAfter: balance });
  return withBal.reverse();
}
