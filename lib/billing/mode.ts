/** Billing runs on simulated data in demo builds (no backend, no Razorpay). Never in production. */
export const BILLING_DEMO = process.env.NEXT_PUBLIC_EXAMIFY_DEMO === "1" && process.env.NODE_ENV !== "production";
