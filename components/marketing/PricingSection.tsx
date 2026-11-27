"use client";

import { useEffect, useState } from "react";
import PlanPicker, { CurrencyToggle } from "@/components/billing/PlanPicker";
import { SIGNUP_BONUS_CREDITS, interviewCost, type Currency } from "@/lib/billing/config";

/** Public pricing: same cards as the in-app payment wall; every option leads to sign-up. */
export default function PricingSection({ ctaHref }: { ctaHref: string }) {
  const [currency, setCurrency] = useState<Currency>("INR");
  useEffect(() => {
    try {
      if (!(Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Calcutta" || navigator.language.endsWith("IN"))) setCurrency("USD");
    } catch {}
  }, []);
  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="type-title max-w-xl">Pay for the interviews you take</h2>
          <p className="mt-4 max-w-lg text-[17px] text-muted-foreground">
            Start with {SIGNUP_BONUS_CREDITS} free credits, enough for two interviews. A 5-question interview uses {interviewCost(5)} credits.
          </p>
        </div>
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </div>
      <PlanPicker currency={currency} selected={{ kind: "pack", id: "" }} onSelect={() => {}} publicHref={ctaHref} />
    </div>
  );
}
