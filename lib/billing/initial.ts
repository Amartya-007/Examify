import type { Balance } from "./client";

/** Server-side: the balance embedded in the page so the first paint is correct. */
export const initialBalance = (u: User): Balance => ({
  credits: u.credits ?? 0,
  plan: u.plan || "free",
  planStatus: u.planStatus ?? null,
  planRenewsAt: u.planRenewsAt ?? null,
});
