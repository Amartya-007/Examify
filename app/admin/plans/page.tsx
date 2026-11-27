import { CREDITS_PER_QUESTION, LOW_BALANCE_THRESHOLD, PACKS, PLANS, SIGNUP_BONUS_CREDITS, formatPrice, interviewCost } from "@/lib/billing/config";

export const metadata = { title: "Plans and pricing" };

/** Read-only view of lib/billing/config.ts so admins can check what customers see. */
export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-page">Plans and pricing</h1>
        <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">
          What customers see on the pricing page and payment wall. To change prices, edit <code className="rounded bg-secondary px-1.5 py-0.5 text-sm">lib/billing/config.ts</code> and the matching Razorpay plans, then redeploy.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["Credits per question", CREDITS_PER_QUESTION, `A 5-question interview costs ${interviewCost(5)}`],
          ["Sign-up bonus", SIGNUP_BONUS_CREDITS, "Given once per account"],
          ["Low balance warning", `< ${LOW_BALANCE_THRESHOLD}`, "Shown in the app and on the Users page"],
        ].map(([k, v, s]) => (
          <div key={String(k)} className="rounded-[20px] border bg-card p-5">
            <p className="text-sm text-muted-foreground">{k}</p>
            <p className="num mt-2 text-3xl font-semibold">{v}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-[20px] border bg-card">
        <h2 className="border-b px-5 py-3 font-sans text-base font-semibold">Credit packs (Razorpay Orders)</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 font-medium">ID</th>
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-5 py-2.5 text-right font-medium">Credits</th>
              <th className="px-5 py-2.5 text-right font-medium">INR</th>
              <th className="px-5 py-2.5 text-right font-medium">USD</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {PACKS.map((p) => (
              <tr key={p.id}>
                <td className="num px-5 py-3 text-muted-foreground">{p.id}</td>
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="num px-5 py-3 text-right">{p.credits}</td>
                <td className="num px-5 py-3 text-right">{formatPrice(p.price.INR, "INR")}</td>
                <td className="num px-5 py-3 text-right">{formatPrice(p.price.USD, "USD")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-[20px] border bg-card">
        <h2 className="border-b px-5 py-3 font-sans text-base font-semibold">Subscriptions (Razorpay Subscriptions)</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 font-medium">ID</th>
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-5 py-2.5 text-right font-medium">Credits</th>
              <th className="px-5 py-2.5 text-right font-medium">INR</th>
              <th className="px-5 py-2.5 text-right font-medium">USD</th>
              <th className="hidden px-5 py-2.5 font-medium md:table-cell">Razorpay plan env</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {PLANS.map((p) => (
              <tr key={p.id}>
                <td className="num px-5 py-3 text-muted-foreground">{p.id}</td>
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="num px-5 py-3 text-right">
                  {p.creditsPerPeriod.toLocaleString()} / {p.interval}
                </td>
                <td className="num px-5 py-3 text-right">{formatPrice(p.price.INR, "INR")}</td>
                <td className="num px-5 py-3 text-right">{formatPrice(p.price.USD, "USD")}</td>
                <td className="hidden px-5 py-3 md:table-cell">
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{p.razorpayPlanEnv}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
