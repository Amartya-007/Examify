/**
 * Billing configuration: the only place prices, packs and plans live.
 * Change numbers here; every screen (pricing, paywall, billing, admin) reads from it.
 * The backend must use the same ids and values when it creates Razorpay orders/subscriptions.
 */

export const CREDITS_PER_QUESTION = 2;
export const SIGNUP_BONUS_CREDITS = 20;
export const LOW_BALANCE_THRESHOLD = 10;

/** Credits an interview costs. A standard 5-question interview costs 10 credits. */
export const interviewCost = (questions: number) => Math.max(1, Math.round(questions)) * CREDITS_PER_QUESTION;

export type Price = { INR: number; USD: number }; // whole currency units
export type Currency = keyof Price;

export type Pack = {
  id: string;
  name: string;
  credits: number;
  price: Price;
  blurb: string;
  highlight?: boolean;
};

export type Plan = {
  id: string;
  name: string;
  interval: "month" | "year";
  creditsPerPeriod: number;
  price: Price;
  blurb: string;
  features: string[];
  highlight?: boolean;
  /** Razorpay plan id, set from env by the backend. Shown here for reference only. */
  razorpayPlanEnv: string;
};

/** One-time credit packs (Razorpay Orders). */
export const PACKS: Pack[] = [
  { id: "try", name: "Try one", credits: 10, price: { INR: 1, USD: 0.05 }, blurb: "One 5-question interview" },
  { id: "starter", name: "Starter", credits: 120, price: { INR: 99, USD: 1.5 }, blurb: "About 12 interviews", highlight: true },
  { id: "plus", name: "Plus", credits: 350, price: { INR: 249, USD: 3.5 }, blurb: "About 35 interviews" },
];

/** Subscriptions (Razorpay Subscriptions). Credits are added at each renewal. */
export const PLANS: Plan[] = [
  {
    id: "pro_month",
    name: "Pro",
    interval: "month",
    creditsPerPeriod: 600,
    price: { INR: 449, USD: 5 },
    blurb: "For steady practice",
    features: ["600 credits every month (about 60 interviews)", "Unused credits roll over for one month", "Priority question generation", "Cancel any time"],
    highlight: true,
    razorpayPlanEnv: "RAZORPAY_PLAN_PRO_MONTH",
  },
  {
    id: "pro_year",
    name: "Pro yearly",
    interval: "year",
    creditsPerPeriod: 7200,
    price: { INR: 4499, USD: 50 },
    blurb: "Two months free",
    features: ["7,200 credits a year, added up front", "Everything in Pro", "Two months free compared with monthly"],
    razorpayPlanEnv: "RAZORPAY_PLAN_PRO_YEAR",
  },
];

export const FREE_PLAN = { id: "free", name: "Free" };

export const planById = (id?: string | null) => PLANS.find((p) => p.id === id) || null;
export const packById = (id?: string | null) => PACKS.find((p) => p.id === id) || null;
export const planName = (id?: string | null) => planById(id)?.name || "Free";

export function formatPrice(amount: number, currency: Currency) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Minor units (paise/cents) to a display string. */
export const formatMinor = (minor: number, currency: Currency) => formatPrice(minor / 100, currency);

export const perInterview = (credits: number, price: number) => price / (credits / interviewCost(5));
